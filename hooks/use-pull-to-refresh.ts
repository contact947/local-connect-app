import { useState, useCallback } from "react";

/**
 * Pull to Refresh機能を提供するカスタムフック
 * TanStack Queryのrefetch関数と連携して使用します
 */
export function usePullToRefresh(refetch: () => Promise<any>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
