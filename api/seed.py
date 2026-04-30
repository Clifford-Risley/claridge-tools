"""
Seed script for Claridge Tools API.

Truncates and re-inserts 10 users and 30 tools.
Run from the /api directory:

    python seed.py
"""

import asyncio

from sqlalchemy import text

from db import AsyncSessionLocal
from models.tool import Tool
from models.user import Role, User

# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

USERS = [
    {
        "email": "harold.baxter@example.com",
        "display_name": "Harold Baxter",
        "phone": "612-555-0142",
        "address": "114 Elm Street, Wayzata, MN 55391",
        "role": Role.admin,
    },
    {
        "email": "carol.novak@example.com",
        "display_name": "Carol Novak",
        "phone": "651-555-0283",
        "address": "229 Oak Avenue, Stillwater, MN 55082",
        "role": Role.member,
    },
    {
        "email": "dennis.wrzesinski@example.com",
        "display_name": "Dennis Wrzesinski",
        "phone": "763-555-0371",
        "address": "807 Birch Lane, Anoka, MN 55303",
        "role": Role.member,
    },
    {
        "email": "linda.kowalczyk@example.com",
        "display_name": "Linda Kowalczyk",
        "phone": "952-555-0459",
        "address": "45 Maple Drive, Eden Prairie, MN 55344",
        "role": Role.member,
    },
    {
        "email": "gary.sundstrom@example.com",
        "display_name": "Gary Sundstrom",
        "phone": "320-555-0512",
        "address": "1102 Pine Road, St. Cloud, MN 56301",
        "role": Role.member,
    },
    {
        "email": "pat.hildebrandt@example.com",
        "display_name": "Pat Hildebrandt",
        "phone": "507-555-0634",
        "address": "318 Walnut Court, Mankato, MN 56001",
        "role": Role.member,
    },
    {
        "email": "ruth.ecklund@example.com",
        "display_name": "Ruth Ecklund",
        "phone": "218-555-0748",
        "address": "67 Cedar Street, Duluth, MN 55802",
        "role": Role.member,
    },
    {
        "email": "mike.przybylski@example.com",
        "display_name": "Mike Przybylski",
        "phone": "715-555-0861",
        "address": "450 Hickory Blvd, Eau Claire, WI 54701",
        "role": Role.member,
    },
    {
        "email": "diane.olheiser@example.com",
        "display_name": "Diane Olheiser",
        "phone": "605-555-0923",
        "address": "93 Linden Lane, Sioux Falls, SD 57103",
        "role": Role.member,
    },
    {
        "email": "tom.schreiber@example.com",
        "display_name": "Tom Schreiber",
        "phone": "701-555-1004",
        "address": "2201 Spruce Avenue, Fargo, ND 58102",
        "role": Role.member,
    },
]

# Each entry is (user_index, name, description, category_tag, notes)
# user_index is 0-based into the USERS list above.
TOOLS = [
    # Harold (0) — 3 tools
    (
        0,
        "Honda EU2200i Generator",
        "2200-watt inverter generator, quiet and fuel-efficient. Good for outages or camping.",
        "power tools",
        "Stored in garage. Runs on fresh 87 octane. Oil changed last fall.",
    ),
    (
        0,
        "Pressure Washer — 2700 PSI",
        "Gas-powered pressure washer with 25-ft hose and surface cleaner attachment.",
        "power tools",
        "Good for driveways, decks, and siding. Winterize before storing.",
    ),
    (
        0,
        "Snow Blower — Ariens 24\"",
        "Two-stage snow blower, electric start, handles heavy wet snow with ease.",
        "seasonal",
        "Full tank of stabilized fuel. Chain-drive model — oil level matters.",
    ),
    # Carol (1) — 3 tools
    (
        1,
        "KitchenAid Stand Mixer",
        "5-quart tilt-head stand mixer with dough hook, whisk, and flat beater.",
        "kitchen/home",
        "Bowl and all three attachments stored inside. Wipe clean before returning.",
    ),
    (
        1,
        "Cordless Brad Nailer — 18V",
        "Ryobi 18V brad nailer for trim work and light framing. No compressor needed.",
        "power tools",
        "Battery not included — bring your own 18V Ryobi ONE+ battery.",
    ),
    (
        1,
        "Tile Saw — 7\"",
        "Wet tile saw with diamond blade. Cuts ceramic, porcelain, and natural stone.",
        "power tools",
        "Blade is fairly new. Empty the reservoir after use to prevent staining.",
    ),
    # Dennis (2) — 3 tools
    (
        2,
        "Lawn Aerator — Spike",
        "Tow-behind spike aerator, 40-inch width. Attach to riding mower.",
        "lawn/garden",
        "Works best when soil is slightly moist. Fill tray with sand for extra weight.",
    ),
    (
        2,
        "Chainsaw — Husqvarna 455 Rancher",
        "18\" bar chainsaw, 55cc engine. Ready for firewood cutting or storm cleanup.",
        "power tools",
        "Chain sharpened recently. Mix 50:1 fuel. Chaps and helmet strongly recommended.",
    ),
    (
        2,
        "Trailer — 5x8 Utility",
        "Open utility trailer with 2\" ball hitch, fold-down rear gate, and tie-down rings.",
        "automotive",
        "Lights work. Spare tire is under the frame. Register as needed per state rules.",
    ),
    # Linda (3) — 3 tools
    (
        3,
        "Garden Tiller — Electric",
        "Greenworks 10-inch corded tiller for raised beds and small garden plots.",
        "lawn/garden",
        "Extension cord required (not included). Rinse tines after each use.",
    ),
    (
        3,
        "Sewing Machine — Brother CS6000i",
        "60-stitch computerized sewing machine with wide table and carrying case.",
        "kitchen/home",
        "Manual included in the case. Bobbins pre-wound in several neutral colors.",
    ),
    (
        3,
        "Pipe Wrench Set — 14\" and 18\"",
        "Heavy-duty cast-iron pipe wrenches for plumbing and mechanical work.",
        "hand tools",
        "Jaws adjusted and clean. Return oiled to prevent rust.",
    ),
    # Gary (4) — 3 tools
    (
        4,
        "Jump Starter — 1000A Peak",
        "Portable lithium jump starter with USB charging ports and built-in flashlight.",
        "automotive",
        "Keep charged between uses. Works on gas engines up to 6.0L and diesel up to 3.0L.",
    ),
    (
        4,
        "Socket Set — 3/8\" Drive, SAE/Metric",
        "108-piece chrome vanadium socket set with ratchet, extensions, and carrying case.",
        "hand tools",
        "Full set. Please return all pieces sorted in the tray.",
    ),
    (
        4,
        "Riding Lawn Mower — Cub Cadet XT1",
        "46-inch deck riding mower, hydrostatic transmission. Good for half-acre+.",
        "lawn/garden",
        "Oil and blade changed this spring. Fuel shutoff under seat — turn off after use.",
    ),
    # Pat (5) — 3 tools
    (
        5,
        "Reciprocating Saw — Milwaukee Fuel",
        "18V brushless recip saw with demo blade and wood/nail blade included.",
        "power tools",
        "Battery and charger included. Blade clamp can be tricky — read the tab.",
    ),
    (
        5,
        "Drain Snake — 25 ft",
        "Manual hand-crank drain snake for clearing sink and tub clogs.",
        "hand tools",
        "Clean and coil after use. Wear gloves — cable picks up grease.",
    ),
    (
        5,
        "Broadcast Spreader — 75 lb",
        "Scotts broadcast spreader for fertilizer, seed, and ice melt.",
        "lawn/garden",
        "Calibration settings on the handle chart. Rinse after using ice melt.",
    ),
    # Ruth (6) — 3 tools
    (
        6,
        "Ladder — 8 ft Fiberglass Step",
        "Werner 8-foot fiberglass step ladder, 250 lb rated. Non-conductive.",
        "hand tools",
        "Check feet for wear before use. Store folded flat in garage.",
    ),
    (
        6,
        "Dehumidifier — 50 Pint",
        "Frigidaire 50-pint dehumidifier with continuous drain hose option.",
        "kitchen/home",
        "Empty bucket or connect drain hose. Filter cleaned and ready.",
    ),
    (
        6,
        "Post Hole Digger — Manual Clamshell",
        "Two-handle clamshell post hole digger, 6-inch diameter. Good for fence posts.",
        "lawn/garden",
        "Works best in loose or sandy soil. Rocky ground will need a power auger.",
    ),
    # Mike (7) — 3 tools
    (
        7,
        "Floor Jack — 3-Ton Aluminum",
        "Low-profile 3-ton aluminum floor jack with quick-lift pump. Fits most trucks.",
        "automotive",
        "Hydraulic fluid full. Use jack stands — never work under a car on the jack alone.",
    ),
    (
        7,
        "Miter Saw — 10\" Sliding Compound",
        "DeWalt 10-inch sliding compound miter saw with laser guide. Cuts crown and base.",
        "power tools",
        "Blade guard in place. Adjust bevel stop if needed. Dust bag attaches to rear port.",
    ),
    (
        7,
        "Leaf Blower — Backpack Style",
        "Echo 58V backpack blower, cordless. Strong enough for wet leaves.",
        "lawn/garden",
        "Battery and charger included. Harness adjusts at shoulder and waist.",
    ),
    # Diane (8) — 3 tools
    (
        8,
        "Wet/Dry Vac — 16 Gallon",
        "Ridgid 16-gallon wet/dry vac with blower function and car-detail accessories.",
        "power tools",
        "Filter installed for dry use. Remove filter for water pickup. Bag stored inside.",
    ),
    (
        8,
        "Canning Kit — Waterbath",
        "Complete waterbath canning set: 21-qt enamel pot, rack, jar lifter, funnel, and lid wand.",
        "kitchen/home",
        "Fits 7 quart jars or 9 pint jars. Comes with Ball Blue Book canning guide.",
    ),
    (
        8,
        "Extension Cord — 100 ft, 12-Gauge",
        "100-foot 12-gauge outdoor extension cord, rated for 20A. Bright orange.",
        "hand tools",
        "Wrap loosely to avoid kinking. Good for power tools and outdoor lighting.",
    ),
    # Tom (9) — 3 tools
    (
        9,
        "Trailer Hitch Ball Mount — 2\" Receiver",
        "Drop hitch with 2-inch ball and 4-flat wiring harness adapter.",
        "automotive",
        "Fits 2-inch receiver hitch. Ball torqued to 250 ft-lbs.",
    ),
    (
        9,
        "Circular Saw — Skil 7-1/4\"",
        "Corded 7-1/4 inch circular saw with rip fence and carbide-tipped blade.",
        "power tools",
        "Blade is sharp. Use the rip fence for straight cuts on sheet goods.",
    ),
    (
        9,
        "Folding Table — 6 ft",
        "Lifetime 6-foot fold-in-half plastic folding table. Holds 300 lbs.",
        "kitchen/home",
        "Wipe down after use. Folds to about 3 feet for easy storage.",
    ),
]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def seed() -> None:
    async with AsyncSessionLocal() as session:
        # Truncate both tables (tools first to respect the FK constraint)
        await session.execute(text("DELETE FROM tools"))
        await session.execute(text("DELETE FROM users"))
        await session.commit()

        # Insert users
        user_objects: list[User] = []
        for data in USERS:
            user = User(**data)
            session.add(user)
            user_objects.append(user)

        await session.flush()  # populate user PKs before referencing them

        # Insert tools
        for user_idx, name, description, category_tag, notes in TOOLS:
            tool = Tool(
                owner_id=user_objects[user_idx].id,
                name=name,
                description=description,
                category_tag=category_tag,
                notes=notes,
            )
            session.add(tool)

        await session.commit()

    print(f"Seeded {len(USERS)} users, {len(TOOLS)} tools.")


if __name__ == "__main__":
    asyncio.run(seed())
