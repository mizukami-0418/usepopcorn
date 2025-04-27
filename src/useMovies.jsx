import { useEffect, useState } from "react";

// APIキーとURLを環境変数から取得
const apiKey = import.meta.env.VITE_OMDb_API_KEY;
const apiUrl = import.meta.env.VITE_OMDb_API_URL;

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // 映画の検索を行うuseEffect
  useEffect(
    // 映画の検索を行う関数
    // useEffectの第2引数にqueryを設定
    // queryが変更されたときに呼び出される
    function () {
      // callback?.(); // コールバック関数を呼び出す
      // AbortControllerを使用してfetchをキャンセルする
      // AbortControllerは、fetchのキャンセルを行うためのAPI
      const controller = new AbortController();

      // fetchMovies関数は、映画を取得するための関数
      // fetchのオプションには、signalを設定
      // signalは、AbortControllerのsignalを使用して設定
      async function fetchMovies() {
        try {
          setIsLoading(true); // ローディング中に設定
          setError(""); // エラーメッセージを空に設定
          const res = await fetch(`${apiUrl}?apikey=${apiKey}&s=${query}`, {
            signal: controller.signal,
          });

          // レスポンスがokでない場合はエラーを投げる
          // res.okは、レスポンスがokであるかどうかを示すプロパティ
          if (!res.ok) {
            throw new Error("映画の取得に失敗しました");
          }

          // レスポンスをJSON形式に変換
          // res.jsonは、レスポンスをJSON形式に変換するメソッド
          // dataは、JSON形式に変換したデータ
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error("映画が見つかりませんでした");
          }

          setMovies(data.Search); // 映画のデータを設定
          setError(""); // エラーメッセージを空に設定
        } catch (err) {
          // エラーがAbortErrorでない場合はエラーメッセージを設定
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setIsLoading(false); // ローディング中をfalseに設定
        }
      }

      // クエリが3文字以上でない場合は、映画のデータを空に設定
      if (query.length < 3) {
        setMovies([]);
        setError("");
        console.log("3文字以上のクエリを入力してください");
        return;
      }

      fetchMovies(); // 映画の取得を行う

      // クリーンアップ関数を返す
      // useEffectのクリーンアップ関数は、コンポーネントがアンマウントされるときに呼び出される
      return () => {
        controller.abort();
      };
    },
    [query] // queryが変更されたときに呼び出される
  );

  return {
    movies,
    isLoading,
    error,
  };
}
