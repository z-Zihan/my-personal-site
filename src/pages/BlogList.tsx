/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { useArticles } from "../hooks/useArticles";
import ArticleCard from "../components/ArticleCard";
import GooeyNav from "../components/effects/GooeyNav";
import Crosshair from "../components/effects/Crosshair";
import { categoryApi } from "../api/category";

function BlogList() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Array<{ id: string | number; name: string }>>([{ id: "all", name: "全部" }]);
  const { articles, loading, pagination, refetch } = useArticles({
    status: "published",
    limit: 18,
    category_id: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const fetchCategories = async () => {
    try {
      const { data } = await categoryApi.getList();
      if (data && data.length > 0) {
        setCategories([{ id: "all", name: "全部" }, ...data]);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // 当分类变化时，重置页码并重新获取文章
    refetch({
      page: 1,
      category_id: selectedCategory !== "all" ? selectedCategory : undefined,
    });
  }, [selectedCategory]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      refetch({ page: newPage });
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-20 pb-24 relative overflow-hidden"
    >
      <Crosshair color="#dc25d0" containerRef={containerRef} />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <h1 className="text-5xl font-bold text-center mb-12 neon-text">
          全部文章
        </h1>

        {/* 分类导航 - GooeyNav */}
        <div className="mb-12 flex justify-center">
          <GooeyNav
            items={categories.map((cat) => ({
              label: cat.name,
              href: "#",
            }))}
            particleCount={15}
            particleDistances={[90, 10]}
            particleR={100}
            initialActiveIndex={0}
            animationTime={600}
            timeVariance={300}
            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            onClick={(index) => {
              setSelectedCategory(categories[index].id);
              setPage(1);
            }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative">
              {/* 脉冲光环 */}
              <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-ping" />
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-cyan-400 rounded-full animate-spin" />
              {/* 中心光点 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse" />
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            {/* 空状态 SVG 插图 */}
            <div className="relative mb-8">
              {/* 背景光晕 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />

              {/* SVG 图标 */}
              <svg
                className="w-32 h-32 text-gray-600 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>

              {/* 浮动小点装饰 */}
              <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
              <div className="absolute bottom-4 left-4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            </div>

            <h3 className="text-2xl font-semibold text-gray-600 mb-3">暂无文章</h3>
            <p className="text-gray-500 text-center max-w-md">
              这里还没有任何文章
              <br />
              <span className="text-sm opacity-70">待博主更新后，精彩内容将在这里展示</span>
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-6 py-2 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-dark transition-all cursor-pointer"
                >
                  上一页
                </button>
                <span className="text-gray-400">
                  第 {page} / {pagination.totalPages} 页
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-6 py-2 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-dark transition-all cursor-pointer"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BlogList;