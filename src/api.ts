const API_KEY = "0bc8bd2db453d7413d1c2844ec617b61";
const BASE_PATH = "https://api.themoviedb.org/3";

export interface Movie {
  id: number;
  backdrop_path: string;
  genre_ids: number[];
  poster_path: string;
  title: string;
  original_title: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  adult: boolean;
  certification?: string;
}

export interface GetMoviesResult {
  dates: {
    maximum: string;
    minimun: string;
  };
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface ReviewResult {
  author: string;
  author_details: {
    avatar_path: string | null;
    name: string;
    rating: number | null;
    username: string;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

interface Idgenres {
  id: number;
  name: string;
}

export interface IdMovie {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: object;
  budget: number;
  genres: Idgenres[];
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: object;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: object;
  production_countries: object;
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: object;
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

//현재 상영 중인 영화 목록
export const getMovies = async (): Promise<GetMoviesResult> => {
  const fetchPage = async (page: number) => {
    const response = await fetch(
      `${BASE_PATH}/movie/now_playing?api_key=${API_KEY}&page=${page}`
    );
    return response.json();
  };

  let allResults: Movie[] = [];
  const totalPages = 5;

  for (let i = 1; i <= totalPages; i++) {
    const pageData = await fetchPage(i);
    allResults = [...allResults, ...pageData.results];
  }

  return { results: allResults } as GetMoviesResult;
};

//키워드
export const searchContents = (keyword: string | null) => {
  return fetch(
    `${BASE_PATH}/search/movie?api_key=${API_KEY}&query=${keyword}`
  ).then((response) => response.json());
};

//영화 장르
export const searchGeneres = () => {
  return fetch(`${BASE_PATH}/genre/movie/list?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
};

//영화 리뷰
export const getReviews = (movieId: number) => {
  return fetch(`${BASE_PATH}/movie/${movieId}/reviews?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
};

//영화 관련 비디오 클립
export const getVideos = (movieId: number) => {
  return fetch(`${BASE_PATH}/movie/${movieId}/videos?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
};

//영화 출연진
export const getCredits = (movieId: number) => {
  return fetch(`${BASE_PATH}/movie/${movieId}/credits?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
};

//특정 장르의 영화 목록
export const searchMoviesByGenre = (genreId: number) => {
  return fetch(
    `${BASE_PATH}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`
  )
    .then((response) => response.json())
    .then((data) => data.results);
};

//id대조 영화값
export const getIdDetaile = (movieId: number) => {
  return fetch(`${BASE_PATH}/movie/${movieId}?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
};

// 자동 완성
export const getAutocompleteResults = (keyword: string | null) => {
  if (!keyword) return Promise.resolve([]);
  return fetch(
    `${BASE_PATH}/search/movie?api_key=${API_KEY}&query=${keyword}&language=ko-KR`
  )
    .then((response) => response.json())
    .then((data) => data.results || []);
};

//인기 영화
export const getPopularMovies = () => {
  return fetch(`${BASE_PATH}/movie/popular?api_key=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => data.results || []);
};

const translateToKoreanCertification = (usCertification: string): string => {
  const certificationMap: Record<string, string> = {
    G: "전체",
    PG: "12",
    "PG-13": "15",
    R: "19",
    "NC-17": "19",
    NR: "미정",
    "": "미정",
  };

  return certificationMap[usCertification] || "미정"; // 매핑되지 않은 값은 "미정"
};

// 여러 영화의 연령 등급을 한 번에 가져오기
export const getCertificationsForMovies = async (movieIds: number[]) => {
  const certificationPromises = movieIds.map(async (id) => {
    const data = await getCertification(id);

    // 미국 (US) 데이터를 확인
    const usRelease = data.results.find(
      (release: any) => release.iso_3166_1 === "US"
    );

    const usCertification =
      usRelease?.release_dates?.[0]?.certification || "NR";

    const koreanCertification = translateToKoreanCertification(usCertification);

    return { id, certification: koreanCertification };
  });

  const results = await Promise.all(certificationPromises);

  // 영화 ID를 키로, 한국식 등급을 값
  return results.reduce(
    (acc, { id, certification }) => ({ ...acc, [id]: certification }),
    {} as Record<number, string>
  );
};

// 영화 연령 등급 API 호출
export const getCertification = async (movieId: number) => {
  const response = await fetch(
    `${BASE_PATH}/movie/${movieId}/release_dates?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data;
};
