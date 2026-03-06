import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useArticles } from "../hooks/useArticles";
import ArticleCard from "../components/ArticleCard";
import GooeyNav from "../components/effects/GooeyNav";
import axios from "axios";
import { API_BASE } from "../constants/apiConstants";

function BlogList() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([{ id: "all", name: "全部" }]);
  const { articles, loading, pagination, refetch } = useArticles({
    status: "published",
    limit: 18,
    category_id: selectedCategory !== "all" ? selectedCategory : undefined,
  });

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

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/categories`);
      if (data.data && data.data.length > 0) {
        setCategories([{ id: "all", name: "全部" }, ...data.data]);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
      refetch({ page: newPage });
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-20 pb-20 relative overflow-hidden"
    >
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
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">加载中...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">暂无文章</p>
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
                  className="px-6 py-2 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-dark transition-all"
                >
                  上一页
                </button>
                <span className="text-gray-400">
                  第 {page} / {pagination.totalPages} 页
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-6 py-2 border border-primary text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-dark transition-all"
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
