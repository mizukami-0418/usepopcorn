import { useState, useEffect } from "react";
import StarRating from "./StarRating";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// APIキーとURLを環境変数から取得
const apiKey = import.meta.env.VITE_OMDb_API_KEY;
const apiUrl = import.meta.env.VITE_OMDb_API_URL;

export default function App() {
  // useStateの設定
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // 選択時の映画IDを設定
  // 映画を選択したときに呼び出される関数
  // setSelectedIdをidに設定し、idがすでに選択されている場合はnullに設定
  // それ以外の場合はidに設定
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  // 映画の詳細を閉じる
  // 閉じるボタンを押したときに呼び出される関数
  // setSelectedIdをnullに設定
  function handleCloseMovie() {
    setSelectedId(null);
  }

  // 視聴済み映画を追加する関数
  // setWatchedを現在のwatchedにmovieを追加したものに設定
  // movieは映画のオブジェクト
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  // 視聴済み映画を削除する関数
  // setSelectedIdをnullに設定
  // setWatchedを現在のwatchedからidと一致しない映画をフィルタリングしたものに設定
  function handleDeleteWatched(id) {
    setSelectedId(null);
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  // 映画の検索を行うuseEffect
  useEffect(
    // 映画の検索を行う関数
    // useEffectの第2引数にqueryを設定
    // queryが変更されたときに呼び出される
    function () {
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

      handleCloseMovie(); // 映画の詳細を閉じる
      fetchMovies(); // 映画の取得を行う

      // クリーンアップ関数を返す
      // useEffectのクリーンアップ関数は、コンポーネントがアンマウントされるときに呼び出される
      return () => {
        controller.abort();
      };
    },
    [query] // queryが変更されたときに呼び出される
  );

  return (
    <>
      <Navbar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        {/* <Box movies={movies}> */}
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {/* ローディング中はLoaderを表示 */}
          {isLoading && <Loader />}
          {/* 映画のデータがある場合はMovieListを表示 */}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {/* 映画のデータがない場合はエラーメッセージを表示 */}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {/* selectIDがある場合はMovieDetailsを表示 */}
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            // selectIDがない場合は映画の詳細を表示しない
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// ローディング中に表示するコンポーネント
function Loader() {
  return (
    <div className="loader">
      <span className="loader__text">Loading...</span>
      <span className="loader__emoji" role="img">
        🍿
      </span>
    </div>
  );
}

// エラーメッセージを表示するコンポーネント
function ErrorMessage({ message }) {
  return (
    <div className="error">
      <p>{message}</p>
    </div>
  );
}

// ナビゲーションバーのコンポーネント
// childrenをpropsとして受け取る
function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

// ロゴのコンポーネント
// usePopcornのロゴを表示するコンポーネント
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// 映画の検索ボックスのコンポーネント
// queryとsetQueryをpropsとして受け取る
// queryは検索ボックスの値
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="映画を検索..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// 検索結果の数を表示するコンポーネント
// moviesをpropsとして受け取る
// moviesは検索結果の映画の配列
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// メインコンテンツのコンポーネント
// childrenをpropsとして受け取る
// childrenはメインコンテンツの子要素
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// 映画のボックスのコンポーネント
// childrenをpropsとして受け取る
// childrenは映画のボックスの子要素
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      {/* トグルボタンをクリックすると、isOpenの値が反転する */}
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList watched={watched} />
        </>
      )}
    </div>
  );
}
*/

// 映画のリストを表示するコンポーネント
// moviesをpropsとして受け取る
// moviesは検索結果の映画の配列
function MovieList({ movies, onSelectMovie }) {
  return (
    // 映画のリストを表示する
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

// 映画のコンポーネント
// movieとonSelectMovieをpropsとして受け取る
function Movie({ movie, onSelectMovie }) {
  return (
    // 映画のリストを表示する
    // 映画をクリックすると、onSelectMovieが呼び出される
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

// 映画の詳細を表示するコンポーネント
// selectedIdとonCloseMovieをpropsとして受け取る
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    imdbRating,
    Runtime: runtime,
    Actors: actors,
    Director: director,
    Genre: genre,
    Released: released,
    Plot: plot,
  } = movie;

  if (imdbRating > 8) return <p>この映画は高評価です</p>;

  // 映画の自己評価を追加する関数
  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      imdbRating: Number(imdbRating),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Escapeキーを押したときに映画の詳細を閉じる
  useEffect(() => {
    function callback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
      }
    }
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [onCloseMovie]);

  // 映画の詳細を取得するuseEffect
  // selectedIdが変更されたときに呼び出される
  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`${apiUrl}?apikey=${apiKey}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
      console.log(data);
    }
    getMovieDetails();
  }, [selectedId]);

  // タイトルを設定するuseEffect
  // titleが変更されたときに呼び出される
  useEffect(() => {
    if (!title) return;
    document.title = `usePopcorn | ${title}`;

    return () => {
      document.title = "usePopcorn";
    };
  }, [title]);

  return (
    <div className="details">
      {/* 映画の詳細を表示する */}
      {/* isLoadingがtrueの場合はLoaderを表示 */}
      {/* isLoadingがfalseの場合は映画の詳細を表示 */}
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`${title} poster`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
              <p>
                <span>🌟</span>
                {userRating} Your rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {/* 星の数を選んで映画の自己評価を追加する */}
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    color="#FFA500"
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + リストに評価を追加
                    </button>
                  )}
                </>
              ) : (
                // 評価済みの映画の場合
                <p>
                  <span>
                    あなたは評価は<span>🌟</span>
                    {watchedUserRating}個です
                  </span>
                </p>
              )}
            </div>
            {/* 映画の紹介 */}
            <p>
              <strong>あらすじ</strong>
            </p>
            <p>
              <em>{plot}</em>
            </p>
            <p>出演：{actors}他</p>
            <p>監督：{director}</p>
          </section>
        </>
      )}
    </div>
  );
}

// 視聴済み映画の評価を表示するコンポーネント
// watchedをpropsとして受け取る
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <>
      <div className="summary">
        <h2>Movies you watched</h2>
        <div>
          <p>
            <span>#️⃣</span>
            <span>{watched.length} movies</span>
          </p>
          <p>
            <span>⭐️</span>
            <span>{avgImdbRating.toFixed(2)}</span>
          </p>
          <p>
            <span>🌟</span>
            <span>{avgUserRating.toFixed(2)}</span>
          </p>
          <p>
            <span>⏳</span>
            <span>{avgRuntime} min</span>
          </p>
        </div>
      </div>
    </>
  );
}

// 視聴済み映画のリストを表示するコンポーネント
// watchedをpropsとして受け取る
function WatchedMoviesList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

// 視聴済み映画のコンポーネント
// movieとonDeleteWatchedをpropsとして受け取る
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <div
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          ✖️
        </div>
      </div>
    </li>
  );
}
