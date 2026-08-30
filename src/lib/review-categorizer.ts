/**
 * Review Categorization System
 * Analyzes and categorizes reviews by main issue/sentiment type
 * Preserves original review text and provides comprehensive statistics
 */

export interface CategorizedReview {
  id?: string;
  customer_name?: string;
  review_text?: string;
  rating?: number;
  platform?: string;
  category: string;
  subcategory?: string;
  sentiment: "positive" | "negative" | "neutral";
  analysis: {
    primary_issue: string;
    confidence: number;
  };
}

export interface ReviewInput {
  id?: string;
  customer_name?: string;
  review_text?: string;
  rating?: number;
  platform?: string;
  analysis?: string | { primary_issue?: string; issue?: string } | null;
  [key: string]: unknown;
}

export interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
  avg_rating: number;
  sentiment_breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  common_issues: string[];
  examples: string[];
}

export interface CategorizationResult {
  total_reviews: number;
  categories: Record<string, CategoryStats>;
  overall_sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    positive_percentage: number;
    negative_percentage: number;
  };
  most_common_issues: Array<{
    issue: string;
    frequency: number;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  summary: string;
}

/**
 * Category definitions with keywords for classification
 */
const CATEGORY_KEYWORDS: Record<string, { keywords: string[]; priority: number }> = {
  "Delivery Issues": {
    keywords: [
      "delivery",
      "late",
      "delayed",
      "driver",
      "courier",
      "wrong address",
      "cold food",
      "spilled",
      "missing items",
      "slow delivery",
      "never arrived",
      "tracking",
      "eta",
      "wait time",
      "hour",
      "minutes late",
      "cancelled delivery",
    ],
    priority: 1,
  },
  "Food Quality Issues": {
    keywords: [
      "cold",
      "soggy",
      "burnt",
      "stale",
      "taste",
      "flavor",
      "raw",
      "undercooked",
      "overcooked",
      "quality",
      "freshness",
      "portion",
      "hair",
      "foreign object",
      "bad meat",
      "greasy",
      "inedible",
      "sick",
      "food poisoning",
    ],
    priority: 1,
  },
  "Billing Problems": {
    keywords: [
      "charge",
      "charged twice",
      "refund",
      "expensive",
      "price",
      "fee",
      "tip",
      "receipt",
      "discount",
      "promo code",
      "coupon",
      "billing",
      "payment",
      "overcharge",
      "hidden fee",
    ],
    priority: 2,
  },
  "App/Technical Issues": {
    keywords: [
      "app",
      "crash",
      "bug",
      "error",
      "login",
      "loading",
      "freeze",
      "glitch",
      "not working",
      "button",
      "checkout failed",
      "payment failed",
      "location",
      "gps",
      "notification",
    ],
    priority: 2,
  },
  "Positive Feedback": {
    keywords: [
      "great",
      "amazing",
      "delicious",
      "fast",
      "best",
      "love",
      "perfect",
      "excellent",
      "wonderful",
      "friendly",
      "hot",
      "fresh",
      "recommended",
      "favorite",
      "awesome",
      "good job",
      "thank you",
      "tasty",
      "quick",
      "convenient",
    ],
    priority: 0,
  },
};

/**
 * Categorize a single review based on keywords and content analysis
 */
export function categorizeReview(
  review: ReviewInput
): { category: string; confidence: number; primary_issue: string } {
  const text = (review.review_text || "").toLowerCase();
  const rating = review.rating || 0;

  // Check sentiment first based on rating
  const isSentimentPositive = rating >= 4;

  // Score each category based on keyword matches
  const categoryScores: Record<string, number> = {};

  for (const [category, config] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of config.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    if (score > 0) {
      categoryScores[category] = score;
    }
  }

  // Determine final category
  let finalCategory = "Other";
  let maxScore = 0;
  let primaryIssue = "General feedback";

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      finalCategory = category;
    }
  }

  // Override for positive reviews
  if (isSentimentPositive && finalCategory === "Other") {
    finalCategory = "Positive Feedback";
  }

  // Extract primary issue from analysis or text
  if (review.analysis && typeof review.analysis === "string") {
    try {
      const analysisObj = JSON.parse(review.analysis);
      primaryIssue = analysisObj.issue || analysisObj.primary_issue || primaryIssue;
    } catch {
      primaryIssue = extractPrimaryIssue(text);
    }
  } else if (review.analysis && typeof review.analysis === "object" && "primary_issue" in review.analysis && review.analysis.primary_issue) {
    primaryIssue = review.analysis.primary_issue;
  } else {
    primaryIssue = extractPrimaryIssue(text);
  }

  const confidence = maxScore > 0 ? Math.min(100, maxScore * 15) : 50;

  return {
    category: finalCategory,
    confidence: confidence,
    primary_issue: primaryIssue,
  };
}

/**
 * Extract primary issue from review text
 */
function extractPrimaryIssue(text: string): string {
  // Common issue patterns
  const issuePatterns: Record<string, string> = {
    "delivery delay": "Delivery Delays",
    "late delivery": "Delivery Delays",
    "cold food": "Food Temperature Issue",
    "undercooked": "Undercooked Food",
    "raw meat": "Undercooked Food",
    "stale": "Stale/Old Food",
    "burnt": "Burnt/Overcooked",
    "missing item": "Missing Items",
    "promo code": "Promo Code Issue",
    "charged twice": "Duplicate Charge",
    "refund": "Refund Issue",
    "app crash": "App Crash",
    "crash": "App Crash",
    "login": "Login Issue",
    "quality": "Food Quality",
  };

  for (const [pattern, issue] of Object.entries(issuePatterns)) {
    if (text.includes(pattern)) {
      return issue;
    }
  }

  return "General Issue";
}

/**
 * Determine sentiment based on rating and analysis
 */
function getSentiment(review: ReviewInput): "positive" | "negative" | "neutral" {
  const rating = review.rating || 0;

  if (rating >= 4) {
    return "positive";
  } else if (rating <= 2) {
    return "negative";
  } else {
    return "neutral";
  }
}

/**
 * Main categorization function - processes all reviews
 */
export function categorizeAllReviews(reviews: ReviewInput[]): CategorizationResult {
  const categorizedReviews: CategorizedReview[] = [];
  const categoryStats: Record<string, CategoryStats> = {};

  // Initialize category stats
  for (const categoryName of Object.keys(CATEGORY_KEYWORDS)) {
    categoryStats[categoryName] = {
      name: categoryName,
      count: 0,
      percentage: 0,
      avg_rating: 0,
      sentiment_breakdown: {
        positive: 0,
        negative: 0,
        neutral: 0,
      },
      common_issues: [],
      examples: [],
    };
  }

  // Add "Other" category
  categoryStats["Other"] = {
    name: "Other",
    count: 0,
    percentage: 0,
    avg_rating: 0,
    sentiment_breakdown: {
      positive: 0,
      negative: 0,
      neutral: 0,
    },
    common_issues: [],
    examples: [],
  };

  // Categorize each review
  const issueFrequency: Record<string, number> = {};
  const overallSentiment = { positive: 0, negative: 0, neutral: 0 };

  for (const review of reviews) {
    const { category, confidence, primary_issue } = categorizeReview(review);
    const sentiment = getSentiment(review);

    const categorized: CategorizedReview = {
      id: review.id,
      customer_name: review.customer_name,
      review_text: review.review_text,
      rating: review.rating,
      platform: review.platform,
      category,
      sentiment,
      analysis: {
        primary_issue,
        confidence,
      },
    };

    categorizedReviews.push(categorized);

    // Update category stats
    if (categoryStats[category]) {
      categoryStats[category].count++;
      categoryStats[category].sentiment_breakdown[sentiment]++;

      // Add example if we have room
      if (categoryStats[category].examples.length < 2 && review.review_text) {
        categoryStats[category].examples.push(
          review.review_text.substring(0, 80) + "..."
        );
      }
    }

    // Track issue frequency
    if (primary_issue !== "General Issue") {
      issueFrequency[primary_issue] = (issueFrequency[primary_issue] || 0) + 1;
    }

    overallSentiment[sentiment]++;
  }

  // Calculate percentages and averages
  for (const category of Object.keys(categoryStats)) {
    const stats = categoryStats[category];
    stats.percentage = (stats.count / reviews.length) * 100;
    stats.avg_rating =
      stats.count > 0
        ? categorizedReviews
            .filter((r) => r.category === category)
            .reduce((sum, r) => sum + (r.rating || 0), 0) / stats.count
        : 0;
  }

  // Get top issues
  const mostCommonIssues = Object.entries(issueFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([issue, frequency]) => ({
      issue,
      frequency,
      severity: (frequency >= 5 ? "high" : frequency >= 3 ? "medium" : "low") as "critical" | "high" | "medium" | "low",
    }));

  // Generate summary
  const summary = generateSummary(
    reviews.length,
    overallSentiment,
    categoryStats,
    mostCommonIssues
  );

  return {
    total_reviews: reviews.length,
    categories: categoryStats,
    overall_sentiment: {
      positive: overallSentiment.positive,
      negative: overallSentiment.negative,
      neutral: overallSentiment.neutral,
      positive_percentage: (overallSentiment.positive / reviews.length) * 100,
      negative_percentage: (overallSentiment.negative / reviews.length) * 100,
    },
    most_common_issues: mostCommonIssues,
    summary,
  };
}

/**
 * Generate human-readable summary
 */
function generateSummary(
  totalReviews: number,
  sentiment: Record<string, number>,
  categoryStats: Record<string, CategoryStats>,
  topIssues: Array<{ issue: string; frequency: number; severity: string }>
): string {
  const positiveCount = sentiment.positive;
  const negativeCount = sentiment.negative;
  const neutralCount = sentiment.neutral;

  const positivePercent = ((positiveCount / totalReviews) * 100).toFixed(1);
  const negativePercent = ((negativeCount / totalReviews) * 100).toFixed(1);

  let summary = `## Review Analysis Summary\n\n`;
  summary += `**Total Reviews Analyzed:** ${totalReviews}\n`;
  summary += `**Overall Sentiment:** ${positivePercent}% Positive | ${negativePercent}% Negative | ${((neutralCount / totalReviews) * 100).toFixed(1)}% Neutral\n\n`;

  // Top categories
  summary += `### Distribution by Category\n`;
  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  for (const [categoryName, stats] of sortedCategories) {
    if (stats.count > 0) {
      summary += `- **${categoryName}:** ${stats.count} reviews (${stats.percentage.toFixed(1)}%) - Avg Rating: ${stats.avg_rating.toFixed(1)}/5\n`;
    }
  }

  // Top issues
  summary += `\n### Top Customer Issues (High Priority)\n`;
  const criticalIssues = topIssues.filter((i) => i.frequency >= 3);
  for (const issue of criticalIssues.slice(0, 5)) {
    summary += `- **${issue.issue}**: Mentioned ${issue.frequency} times (${issue.severity.toUpperCase()} severity)\n`;
  }

  // Overall sentiment narrative
  summary += `\n### Overall Sentiment Analysis\n`;

  if (Number(positivePercent) > 50) {
    summary += `The business maintains a **positive reputation** with over ${positivePercent}% satisfaction rate. `;
    summary += `Customers praise consistent quality, fast delivery, and excellent customer service. `;
  } else {
    summary += `The business faces **significant challenges** with ${negativePercent}% negative sentiment. `;
  }

  if (negativeCount > 0) {
    summary += `\nTop complaint categories are **${sortedCategories[0][0]}** and **${sortedCategories[1]?.[0] || "Other"}**, `;
    summary += `requiring immediate operational review and corrective action.`;
  }

  return summary;
}

/**
 * Format categorization result for display
 */
export function formatCategoryReport(result: CategorizationResult): string {
  let report = `\n${"=".repeat(80)}\n`;
  report += `REVIEW CATEGORIZATION REPORT\n`;
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `${"=".repeat(80)}\n\n`;

  // Overall Stats
  report += `📊 OVERALL STATISTICS\n`;
  report += `${"-".repeat(80)}\n`;
  report += `Total Reviews: ${result.total_reviews}\n`;
  report += `Positive: ${result.overall_sentiment.positive} (${result.overall_sentiment.positive_percentage.toFixed(1)}%)\n`;
  report += `Negative: ${result.overall_sentiment.negative} (${result.overall_sentiment.negative_percentage.toFixed(1)}%)\n`;
  report += `Neutral: ${result.overall_sentiment.neutral}\n\n`;

  // Category Breakdown
  report += `📂 CATEGORY BREAKDOWN\n`;
  report += `${"-".repeat(80)}\n`;

  const sortedCategories = Object.entries(result.categories)
    .sort(([, a], [, b]) => b.count - a.count)
    .filter(([, stats]) => stats.count > 0);

  for (const [categoryName, stats] of sortedCategories) {
    report += `\n${categoryName.toUpperCase()}\n`;
    report += `  Count: ${stats.count} reviews (${stats.percentage.toFixed(1)}%)\n`;
    report += `  Avg Rating: ${stats.avg_rating.toFixed(2)}/5\n`;
    report += `  Sentiment: Positive: ${stats.sentiment_breakdown.positive} | Negative: ${stats.sentiment_breakdown.negative} | Neutral: ${stats.sentiment_breakdown.neutral}\n`;

    if (stats.examples.length > 0) {
      report += `  Sample Review: "${stats.examples[0]}"\n`;
    }
  }

  // Top Issues
  report += `\n\n⚠️  TOP ISSUES BY FREQUENCY\n`;
  report += `${"-".repeat(80)}\n`;

  for (let i = 0; i < Math.min(10, result.most_common_issues.length); i++) {
    const issue = result.most_common_issues[i];
    const severity = issue.severity === "critical" ? "🔴" : issue.severity === "high" ? "🟠" : "🟡";
    report += `${i + 1}. ${severity} ${issue.issue} - ${issue.frequency} mentions (${issue.severity.toUpperCase()})\n`;
  }

  // Summary
  report += `\n\n📝 EXECUTIVE SUMMARY\n`;
  report += `${"-".repeat(80)}\n`;
  report += result.summary;

  report += `\n\n${"=".repeat(80)}\n`;

  return report;
}
