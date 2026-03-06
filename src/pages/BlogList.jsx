import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useArticles } from "../hooks/useArticles";
import ArticleCard from "../components/ArticleCard";
import PixelCard from "../components/effects/PixelCard";
import axios from "axios";
import { API_BASE } from "../constants/apiConstants";
import { motion } from "framer-motion";
import LightPillar from "../components/effects/LightPillar";

function BlogList() {
  const navigate = useNavigate();
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
    <div className="min-h-screen pt-20 pb-20 relative overflow-hidden">
      {/* <div className="absolute inset-0 z-0">
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
          rotationSpeed={0.3}
          interactive={false}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0.5}
          pillarRotation={25}
        />
      </div> */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <h1 className="text-5xl font-bold text-center mb-12 neon-text">
          全部文章
        </h1>

        {/* 分类 Tab - 炫酷切换效果 */}
        <div className="mb-12">
          <div className="flex justify-center flex-wrap gap-2">
            {categories.map((cat, index) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`relative px-6 py-3 rounded-lg font-medium transition-all overflow-hidden ${
                  selectedCategory === cat.id
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedCategory === cat.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <PixelCard
                key={i}
                variant="purple"
                className="h-80 animate-pulse"
              />
            ))}
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
