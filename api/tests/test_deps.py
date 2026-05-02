import time
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey, RSAPublicKey
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from jwt import encode as jwt_encode
from sqlalchemy.ext.asyncio import AsyncSession

from deps import get_current_user
from models.user import User


@pytest.fixture(scope="module")
def _rsa_private_key() -> RSAPrivateKey:
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture(scope="module")
def _rsa_public_key(_rsa_private_key: RSAPrivateKey) -> RSAPublicKey:
    return _rsa_private_key.public_key()


@pytest.fixture(scope="module")
def _other_private_key() -> RSAPrivateKey:
    """A second RSA private key — used to produce a token with a wrong signature."""
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _make_token(
    private_key: RSAPrivateKey,
    *,
    sub: str = "clerk_abc123",
    issuer: str = "https://clerk.test",
    exp_offset: int = 3600,
) -> str:
    payload = {
        "sub": sub,
        "iss": issuer,
        "exp": int(time.time()) + exp_offset,
        "iat": int(time.time()),
    }
    return jwt_encode(payload, private_key, algorithm="RS256")


def _mock_jwks_client(public_key: RSAPublicKey) -> MagicMock:
    signing_key = MagicMock()
    signing_key.key = public_key
    client = MagicMock()
    client.get_signing_key_from_jwt.return_value = signing_key
    return client


# ---------------------------------------------------------------------------
# 1. Missing token → 401
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_missing_token_raises_401() -> None:
    mock_request = MagicMock()
    mock_request.method = "GET"
    mock_db = AsyncMock(spec=AsyncSession)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(request=mock_request, credentials=None, db=mock_db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Not authenticated"


# ---------------------------------------------------------------------------
# 2. Valid JWT → returns the matching user
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_valid_jwt_returns_user(
    _rsa_private_key: RSAPrivateKey,
    _rsa_public_key: RSAPublicKey,
    test_user: User,
) -> None:
    assert test_user.clerk_id is not None
    token = _make_token(_rsa_private_key, sub=test_user.clerk_id)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)

    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = test_user
    mock_db = AsyncMock(spec=AsyncSession)
    mock_db.execute.return_value = result_mock

    mock_request = MagicMock()
    mock_request.method = "GET"

    with patch("deps._get_jwks_client", return_value=_mock_jwks_client(_rsa_public_key)):
        with patch("deps.settings") as mock_settings:
            mock_settings.clerk_issuer = "https://clerk.test"
            user = await get_current_user(request=mock_request, credentials=credentials, db=mock_db)

    assert user is test_user


# ---------------------------------------------------------------------------
# 3. Expired JWT → 401
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_expired_jwt_raises_401(
    _rsa_private_key: RSAPrivateKey,
    _rsa_public_key: RSAPublicKey,
) -> None:
    token = _make_token(_rsa_private_key, exp_offset=-3600)  # expired 1 hour ago
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    mock_db = AsyncMock(spec=AsyncSession)

    mock_request = MagicMock()
    mock_request.method = "GET"

    with patch("deps._get_jwks_client", return_value=_mock_jwks_client(_rsa_public_key)):
        with patch("deps.settings") as mock_settings:
            mock_settings.clerk_issuer = "https://clerk.test"
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(request=mock_request, credentials=credentials, db=mock_db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Token expired"


# ---------------------------------------------------------------------------
# 4. Invalid signature → 401
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_invalid_signature_raises_401(
    _rsa_private_key: RSAPrivateKey,
    _other_private_key: RSAPrivateKey,
) -> None:
    # Token signed with _other_private_key; JWKS returns _rsa_private_key's
    # public key — jwt.decode raises InvalidSignatureError → 401.
    token = _make_token(_other_private_key)
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    mock_db = AsyncMock(spec=AsyncSession)

    mock_request = MagicMock()
    mock_request.method = "GET"

    wrong_public_key: RSAPublicKey = _rsa_private_key.public_key()
    with patch("deps._get_jwks_client", return_value=_mock_jwks_client(wrong_public_key)):
        with patch("deps.settings") as mock_settings:
            mock_settings.clerk_issuer = "https://clerk.test"
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user(request=mock_request, credentials=credentials, db=mock_db)

    assert exc_info.value.status_code == 401
    assert exc_info.value.detail == "Invalid token"
