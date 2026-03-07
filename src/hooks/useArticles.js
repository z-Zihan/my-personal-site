/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { articleApi } from "../api/index";

export function useArticles(initialParams = {}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: initialParams.limit || 18,
    total: 0,
    totalPages: 0,
  });

  const fetchArticles = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data, pagination } = await articleApi.getList({
        ...initialParams,
        ...params,
      });
      console.log("data", data);
      setArticles(data || []);
      setPagination(pagination || pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [initialParams.category_id, initialParams.limit]);

  return { articles, loading, error, pagination, refetch: fetchArticles };
}
