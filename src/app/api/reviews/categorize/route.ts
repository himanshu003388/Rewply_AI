import { NextRequest, NextResponse } from "next/server";
import {
  categorizeAllReviews,
  formatCategoryReport,
  type CategorizationResult,
} from "@/lib/review-categorizer";

/**
 * All 50 reviews from seed data with categorization
 */
const REVIEWS_DATA = [
  // --- 15 DELIVERY COMPLAINTS ---
  {
    id: "f1a10001-0000-4000-8000-000000000001",
    platform: "google",
    customer_name: "Marcus Vance",
    review_text:
      "Ordered the Double Truffle Smash burger at 7:15 PM and it arrived stone cold at 8:50 PM. Driver claimed traffic was bad, but tracking showed him stationary 2 miles away for 40 minutes. Ruined dinner night.",
    rating: 1,
  },
  {
    id: "f1a10002-0000-4000-8000-000000000002",
    platform: "yelp",
    customer_name: "Sophia Chen",
    review_text:
      "The delivery driver dropped the bag right onto my porch steps upside down. The drinks burst open and soaked all the burger buns into mush. Tried calling support but no answer.",
    rating: 1,
  },
  {
    id: "f1a10003-0000-4000-8000-000000000003",
    platform: "trustpilot",
    customer_name: "David Reynolds",
    review_text:
      "Driver left the food at the wrong building entirely (Building B instead of Building D) and didn't even ring the buzzer or take a clear drop-off photo. By the time I hunted it down, the fries were soggy.",
    rating: 2,
  },
  {
    id: "f1a10004-0000-4000-8000-000000000004",
    platform: "google",
    customer_name: "Elena Rostova",
    review_text:
      "Estimated delivery was 25-35 mins. It took over 75 mins on a Tuesday afternoon. Burger was lukewarm and cheese had hardened back up.",
    rating: 2,
  },
  {
    id: "f1a10005-0000-4000-8000-000000000005",
    platform: "yelp",
    customer_name: "Brian K. Miller",
    review_text:
      "Driver took multiple stops in the opposite direction before heading to my place. BurgerHub needs dedicated couriers or better thermal bags.",
    rating: 2,
  },
  {
    id: "f1a10006-0000-4000-8000-000000000006",
    platform: "google",
    customer_name: "Chloe Bennett",
    review_text:
      "My order was marked as 'Delivered' on the app but nothing was outside my door or lobby. Had to wait 30 minutes for support to figure out it was left on the street sidewalk!",
    rating: 1,
  },
  {
    id: "f1a10007-0000-4000-8000-000000000007",
    platform: "trustpilot",
    customer_name: "Timothy Wright",
    review_text:
      "Courier refused to bring the order to the 3rd floor apartment despite specific instructions and elevator access. Forced me to come down in the rain.",
    rating: 2,
  },
  {
    id: "f1a10008-0000-4000-8000-000000000008",
    platform: "google",
    customer_name: "Jessica Gomez",
    review_text:
      "Food arrived an hour late, and the seal sticker on the BurgerHub bag was torn open. Did not feel safe eating the food.",
    rating: 1,
  },
  {
    id: "f1a10009-0000-4000-8000-000000000009",
    platform: "yelp",
    customer_name: "Anthony Foster",
    review_text:
      "Ordered lunch for an office meeting at 11:30 AM for 12:15 PM delivery. Arrived at 1:10 PM after everyone had already dispersed. Terrible reliability.",
    rating: 1,
  },
  {
    id: "f1a10010-0000-4000-8000-000000000010",
    platform: "google",
    customer_name: "Samantha Lee",
    review_text:
      "Driver forgot the 2 chocolate milkshakes and 2 large fries in his car and drove off. When I messaged him, he said contact support. Support took 2 days to reply.",
    rating: 1,
  },
  {
    id: "f1a10011-0000-4000-8000-000000000011",
    platform: "trustpilot",
    customer_name: "Oliver Hudson",
    review_text:
      "The courier called me 4 times unable to find a simple street corner. Food was freezing by the time he finally handed it over.",
    rating: 2,
  },
  {
    id: "f1a10012-0000-4000-8000-000000000012",
    platform: "google",
    customer_name: "Rachel Sterling",
    review_text:
      "Driver placed the bag right against an outward-swinging screen door. When I opened the door, it knocked over the drinks and smashed the burger.",
    rating: 2,
  },
  {
    id: "f1a10013-0000-4000-8000-000000000013",
    platform: "yelp",
    customer_name: "Daniel Peterson",
    review_text:
      "Waited 50 minutes for a simple cheese burger combo only 1.2 miles away. Burger was sweaty in the plastic container and fries were limp.",
    rating: 2,
  },
  {
    id: "f1a10014-0000-4000-8000-000000000014",
    platform: "google",
    customer_name: "Hannah Brooks",
    review_text:
      "Delivery was marked complete at 8 PM, but driver only showed up at 8:25 PM. He smelled strongly of cigarette smoke and the food bag absorbed the smell.",
    rating: 1,
  },
  {
    id: "f1a10015-0000-4000-8000-000000000015",
    platform: "trustpilot",
    customer_name: "Kevin Zhao",
    review_text:
      "BurgerHub delivery driver was extremely rude when asking for delivery gate code, shouting over the phone. Food was cold too.",
    rating: 1,
  },

  // --- 10 FOOD QUALITY ISSUES ---
  {
    id: "f1a20001-0000-4000-8000-000000000016",
    platform: "yelp",
    customer_name: "Austin Matthews",
    review_text:
      "Ordered the Wagyu Smash Patty medium-well, but both patties were almost raw and pink in the middle. Couldn't eat it. Really disappointed given the $22 price tag.",
    rating: 1,
  },
  {
    id: "f1a20002-0000-4000-8000-000000000017",
    platform: "google",
    customer_name: "Megan Foxx",
    review_text:
      "The brioche buns were completely stale and crumbly, like they were 4 days old. The bacon on the BBQ burger was burnt to a crisp black charcoal.",
    rating: 2,
  },
  {
    id: "f1a20003-0000-4000-8000-000000000018",
    platform: "google",
    customer_name: "Trevor Vance",
    review_text:
      "Paid extra $3.50 for signature truffle aioli and caramelized onions. Neither was on the burger! Just dry plain meat and lettuce.",
    rating: 2,
  },
  {
    id: "f1a20004-0000-4000-8000-000000000019",
    platform: "trustpilot",
    customer_name: "Rebecca Dunn",
    review_text:
      "The Truffle Parmesan Fries were completely drenched in old cooking oil and so salty they were inedible. Had to throw the entire box away.",
    rating: 1,
  },
  {
    id: "f1a20005-0000-4000-8000-000000000020",
    platform: "yelp",
    customer_name: "Carlos Mendez",
    review_text:
      "Ordered the Crispy Chicken Burger and the chicken breast was fibrous and rubbery. Tasted like it was microwaved rather than freshly fried.",
    rating: 2,
  },
  {
    id: "f1a20006-0000-4000-8000-000000000021",
    platform: "google",
    customer_name: "Danielle Moore",
    review_text:
      "Found a small piece of hard plastic packaging inside the melted cheddar cheese. Very dangerous! Please check your kitchen prep stations.",
    rating: 1,
  },
  {
    id: "f1a20007-0000-4000-8000-000000000022",
    platform: "yelp",
    customer_name: "Logan Wright",
    review_text:
      "Burger patty was paper thin, completely overcooked and dry as cardboard. Used to love BurgerHub, but quality has plummeted recently.",
    rating: 2,
  },
  {
    id: "f1a20008-0000-4000-8000-000000000023",
    platform: "trustpilot",
    customer_name: "Brooke Taylor",
    review_text:
      "Ordered gluten-free bun due to gluten intolerance, but received regular wheat bun. Luckily noticed before taking a big bite. Careless kitchen error.",
    rating: 1,
  },
  {
    id: "f1a20009-0000-4000-8000-000000000024",
    platform: "google",
    customer_name: "Jordan Hayes",
    review_text:
      "The milkshakes were 80% liquid and melted like sweet warm milk. No ice cream texture left.",
    rating: 2,
  },
  {
    id: "f1a20010-0000-4000-8000-000000000025",
    platform: "yelp",
    customer_name: "Vanessa Diaz",
    review_text:
      "Sauce overload ruined what could have been a decent burger. The bun disintegrated within 2 minutes of opening the wrapper.",
    rating: 2,
  },

  // --- 8 BILLING PROBLEMS ---
  {
    id: "f1a30001-0000-4000-8000-000000000026",
    platform: "trustpilot",
    customer_name: "Gregory Scott",
    review_text:
      "Applied a 25% discount promo code at checkout (SUMMERBURGER). The app showed the discounted total, but my credit card statement shows the full $48.50 charged!",
    rating: 1,
  },
  {
    id: "f1a30002-0000-4000-8000-000000000027",
    platform: "google",
    customer_name: "Patricia White",
    review_text:
      "Cancelled an order within 30 seconds because I selected the wrong delivery address. Was told instant refund would process, but 10 days later still no money in my bank.",
    rating: 1,
  },
  {
    id: "f1a30003-0000-4000-8000-000000000028",
    platform: "yelp",
    customer_name: "Nathaniel Drake",
    review_text:
      "Hidden $4.99 'Service Optimization Fee' added on top of delivery fee and taxes at the very last step. Very deceptive pricing.",
    rating: 2,
  },
  {
    id: "f1a30004-0000-4000-8000-000000000029",
    platform: "trustpilot",
    customer_name: "Fiona Gallagher",
    review_text:
      "Charged twice on my Visa card for the same single order #BH-8921. Bank confirmed two separate identical authorizations.",
    rating: 1,
  },
  {
    id: "f1a30005-0000-4000-8000-000000000030",
    platform: "google",
    customer_name: "Warren Buffet Jr",
    review_text:
      "Default tip calculation defaulted to 30% without explicit confirmation. Sneaky UI design.",
    rating: 2,
  },
  {
    id: "f1a30006-0000-4000-8000-000000000031",
    platform: "trustpilot",
    customer_name: "Chloe Simmons",
    review_text:
      "Purchased a $50 BurgerHub e-gift card for my brother's birthday. The card balance showed $0 upon activation. Support took a week to resolve.",
    rating: 2,
  },
  {
    id: "f1a30007-0000-4000-8000-000000000032",
    platform: "yelp",
    customer_name: "Justin Bieberly",
    review_text:
      "Subscription loyalty program 'BurgerPass' renewed and charged my card after I explicitly cancelled it 2 weeks prior in settings.",
    rating: 1,
  },
  {
    id: "f1a30008-0000-4000-8000-000000000033",
    platform: "google",
    customer_name: "Ashley Parker",
    review_text:
      "Receipt in the bag showed $32.00, but app charged me $39.50. Where did the extra $7.50 go? No itemized explanation.",
    rating: 2,
  },

  // --- 12 POSITIVE REVIEWS ---
  {
    id: "f1a40001-0000-4000-8000-000000000034",
    platform: "google",
    customer_name: "Liam Neeson-Smith",
    review_text:
      "Hands down the best smash burger delivery in the city! Delivered in 22 minutes, piping hot, and the truffle aioli dip is to die for. 10/10.",
    rating: 5,
  },
  {
    id: "f1a40002-0000-4000-8000-000000000035",
    platform: "google",
    customer_name: "Emma Watson-Jones",
    review_text:
      "BurgerHub Delivery saved our family game night. Ordered 6 custom combos, every single customization was 100% accurate, and food was fresh!",
    rating: 5,
  },
  {
    id: "f1a40003-0000-4000-8000-000000000036",
    platform: "yelp",
    customer_name: "Zachary Taylor",
    review_text:
      "The Smokey BBQ Bacon Burger had the crispiest bacon and the meat had that perfect caramelized crust. Driver was super polite too.",
    rating: 5,
  },
  {
    id: "f1a40004-0000-4000-8000-000000000037",
    platform: "google",
    customer_name: "Olivia Martinez",
    review_text:
      "Crispy Cajun Fries were still actually crispy upon arrival! That ventilated box packaging they use really makes a huge difference.",
    rating: 5,
  },
  {
    id: "f1a40005-0000-4000-8000-000000000038",
    platform: "trustpilot",
    customer_name: "Lucas Graham",
    review_text:
      "Incredible customer support. There was a slight 10 min delay due to thunderstorm, and they preemptively sent an apology text and $5 voucher before I even noticed.",
    rating: 5,
  },
  {
    id: "f1a40006-0000-4000-8000-000000000039",
    platform: "google",
    customer_name: "Grace Hopper-Lee",
    review_text:
      "As a vegan, finding a good plant-based smash burger is tough. The Beyond Smash from BurgerHub was juicy, seasoned wonderfully, and dairy-free cheese was melted to perfection.",
    rating: 5,
  },
  {
    id: "f1a40007-0000-4000-8000-000000000040",
    platform: "yelp",
    customer_name: "Mason Cooper",
    review_text:
      "Consistently delicious. Ordered 15+ times over the past 3 months and quality never dips. Double Cheddar Smash is unbeatable.",
    rating: 5,
  },
  {
    id: "f1a40008-0000-4000-8000-000000000041",
    platform: "google",
    customer_name: "Isabella Rossi",
    review_text:
      "The salted caramel milkshake arrived thick and chilled. Driver arrived in under 20 mins. Will definitely order again.",
    rating: 5,
  },
  {
    id: "f1a40009-0000-4000-8000-000000000042",
    platform: "trustpilot",
    customer_name: "Ethan Huntley",
    review_text:
      "Great portion sizes for the price. The Triple Hub stack was huge and fed two of us easily with loaded fries.",
    rating: 4,
  },
  {
    id: "f1a40010-0000-4000-8000-000000000043",
    platform: "google",
    customer_name: "Ava Sinclair",
    review_text:
      "Love the eco-friendly compostable packaging and rapid contactless delivery. Clean, delicious, guilt-free.",
    rating: 5,
  },
  {
    id: "f1a40011-0000-4000-8000-000000000044",
    platform: "yelp",
    customer_name: "Noah Sterling",
    review_text:
      "Best late night delivery in town. Open till 3 AM and the quality at 2 AM was just as good as prime dinner time.",
    rating: 5,
  },
  {
    id: "f1a40012-0000-4000-8000-000000000045",
    platform: "google",
    customer_name: "Mia Thorne",
    review_text:
      "The spicy jalapeño ranch smash is unbeatable. Perfectly spicy with tangy house pickles. Fast delivery too.",
    rating: 5,
  },

  // --- 5 APP / TECHNICAL ISSUES ---
  {
    id: "f1a50001-0000-4000-8000-000000000046",
    platform: "google",
    customer_name: "Benjamin Cole",
    review_text:
      "App crashes continuously every time I try to hit the 'Place Order' button with Apple Pay on iOS 17. Lost my cart twice.",
    rating: 2,
  },
  {
    id: "f1a50002-0000-4000-8000-000000000047",
    platform: "trustpilot",
    customer_name: "Victoria Vance",
    review_text:
      "Live GPS courier tracking map was completely stuck showing the driver at the restaurant for 45 minutes, then suddenly he knocked on the door. No delivery notifications received.",
    rating: 2,
  },
  {
    id: "f1a50003-0000-4000-8000-000000000048",
    platform: "google",
    customer_name: "Tyler Reed",
    review_text:
      "The BurgerHub app keeps logging me out every 5 minutes and the SMS OTP verification code takes 10+ minutes to arrive, by which time it expires.",
    rating: 1,
  },
  {
    id: "f1a50004-0000-4000-8000-000000000049",
    platform: "yelp",
    customer_name: "Zoe Zimmerman",
    review_text:
      "Search and allergen filters on the web app don't work properly. Checking 'Nut Allergy' still showed peanut butter shake in the recommended add-ons.",
    rating: 2,
  },
  {
    id: "f1a50005-0000-4000-8000-000000000050",
    platform: "trustpilot",
    customer_name: "Henry Wallace",
    review_text:
      "Re-order button in order history duplicated my previous items 4 times in the cart without warning, causing checkout errors.",
    rating: 2,
  },
];

/**
 * GET - Retrieve categorization results
 * Query params:
 * - format: 'json' | 'html' | 'text' (default: 'json')
 * - summary: 'true' | 'false' (default: 'true')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";
    const includeSummary = searchParams.get("summary") !== "false";

    // Run categorization
    const result: CategorizationResult = categorizeAllReviews(REVIEWS_DATA);

    if (format === "text") {
      // Plain text format
      const report = formatCategoryReport(result);
      return new NextResponse(report, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } else if (format === "html") {
      // HTML format
      const report = formatCategoryReport(result);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Review Categorization Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            pre { background: white; padding: 15px; border-radius: 5px; overflow-x: auto; }
            h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>🍔 Review Categorization Report</h1>
          <pre>${report}</pre>
        </body>
        </html>
      `;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } else {
      // JSON format (default)
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Categorization error:", error);
    return NextResponse.json(
      {
        error: "Failed to categorize reviews",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Process custom reviews
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reviews = body.reviews || [];

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of reviews in the request body" },
        { status: 400 }
      );
    }

    // Run categorization on custom reviews
    const result: CategorizationResult = categorizeAllReviews(reviews);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Categorization error:", error);
    return NextResponse.json(
      {
        error: "Failed to process reviews",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
