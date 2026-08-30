"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CategoryStats {
  name: string;
  count: number;
  percentage: number;
  avg_rating: number;
  sentiment_breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface CategorizationResult {
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
    severity: string;
  }>;
  summary: string;
}

const SENTIMENT_COLORS = {
  positive: "#4D96FF",
  negative: "#FF6B6B",
  neutral: "#A9A9A9",
};

export default function ReviewCategorization() {
  const [data, setData] = useState<CategorizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/reviews/categorize");
        if (!response.ok) throw new Error("Failed to fetch categorization data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const categoryChartData = Object.entries(data.categories)
    .filter(([, stats]) => stats.count > 0)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      percentage: stats.percentage.toFixed(1),
    }))
    .sort((a, b) => b.count - a.count);

  const sentimentChartData = [
    { name: "Positive", value: data.overall_sentiment.positive },
    { name: "Negative", value: data.overall_sentiment.negative },
    { name: "Neutral", value: data.overall_sentiment.neutral },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">🍔 Review Analysis Dashboard</h1>
          <p className="text-gray-600">AI-powered review categorization and sentiment analysis</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <MetricCard title="Total Reviews" value={data.total_reviews} icon="📊" />
          <MetricCard
            title="Positive Reviews"
            value={data.overall_sentiment.positive}
            subtext={`${data.overall_sentiment.positive_percentage.toFixed(1)}%`}
            icon="😊"
            color="bg-blue-50"
          />
          <MetricCard
            title="Negative Reviews"
            value={data.overall_sentiment.negative}
            subtext={`${data.overall_sentiment.negative_percentage.toFixed(1)}%`}
            icon="😞"
            color="bg-red-50"
          />
          <MetricCard title="Neutral Reviews" value={data.overall_sentiment.neutral} icon="😐" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Categories Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">📂 Reviews by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4D96FF" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment Pie Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">💭 Overall Sentiment</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sentimentChartData} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={80} fill="#8884d8" dataKey="value">
                  <Cell fill={SENTIMENT_COLORS.positive} />
                  <Cell fill={SENTIMENT_COLORS.negative} />
                  <Cell fill={SENTIMENT_COLORS.neutral} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Issues */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">⚠️ Top Issues by Frequency</h2>
          <div className="space-y-4">
            {data.most_common_issues.slice(0, 8).map((issue, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">{idx + 1}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{issue.issue}</p>
                      <p className="text-sm text-gray-500">
                        {issue.frequency} mentions
                        {issue.severity === "critical" && " · 🔴 Critical"}
                        {issue.severity === "high" && " · 🔴 High Priority"}
                        {issue.severity === "medium" && " · 🟠 Medium"}
                        {issue.severity === "low" && " · 🟡 Low"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      issue.severity === "critical" || issue.severity === "high"
                        ? "bg-red-500"
                        : issue.severity === "medium"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }`}
                    style={{ width: `${(issue.frequency / Math.max(...data.most_common_issues.map((i) => i.frequency))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📈 Category Details</h2>
          {categoryChartData.map((cat) => {
            const categoryData = data.categories[cat.name];
            return (
              <div key={cat.name} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.count} reviews · {cat.percentage}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{categoryData.avg_rating.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Average Rating</p>
                  </div>
                </div>

                <div className="bg-gray-100 rounded p-4 mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Sentiment Breakdown</p>
                  <div className="flex gap-2">
                    {categoryData.sentiment_breakdown.positive > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">
                          Positive: {categoryData.sentiment_breakdown.positive}
                        </span>
                      </div>
                    )}
                    {categoryData.sentiment_breakdown.negative > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">
                          Negative: {categoryData.sentiment_breakdown.negative}
                        </span>
                      </div>
                    )}
                    {categoryData.sentiment_breakdown.neutral > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                        <span className="text-sm">
                          Neutral: {categoryData.sentiment_breakdown.neutral}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">📝 Executive Summary</h2>
          <div className="prose prose-sm max-w-none">
            <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-xs">{data.summary}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon?: string;
  color?: string;
}

function MetricCard({ title, value, subtext, icon = "📊", color = "bg-slate-50" }: MetricCardProps) {
  return (
    <div className={`${color} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

function renderCustomLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: CustomLabelProps) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" className="font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}
