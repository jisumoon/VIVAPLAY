import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { getMovies, GetMoviesResult } from "../api";
import { makeImagePath } from "../utils/utils";
import { useNavigate } from "react-router-dom";
import SliderComponent from "../components/Main/Slider";
import TopSlider from "../components/Main/TopSlider";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Loading from "../components/Loading";
import { Helmet } from "react-helmet";

const Container = styled.div`
  width: 100%;
  padding-bottom: 40px;
  background: ${(props) => props.theme.black.lighter};
  @media (max-width: 768px) {
    padding-bottom: 100px;
  }
`;

const Loader = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  color: ${(props) => props.theme.red};
`;

const Banner = styled.div<{ $bgPhoto: string }>`
  width: 98%;
  height: 500px;
  margin: 0 auto;
  margin-top: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 20px;
  padding: 60px;
  position: relative;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)),
    url(${(props) => props.$bgPhoto}) center/cover no-repeat;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out;

  @media (max-width: 768px) {
    height: 300px;
    margin-top: 30px;
  }
  @media (max-width: 400px) {
    padding: 0 20px;
  }
`;

const Title = styled.h2`
  font-size: 50px;
  margin-bottom: 20px;
  color: ${(props) => props.theme.white.lighter};
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Overview = styled.p`
  font-size: 20px;
  color: ${(props) => props.theme.white.darker};
  width: 50%;
  line-height: 1.5;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const BannerButton = styled.button`
  padding: 14px 20px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: ${(props) => props.theme.blue.darker};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    background: ${(props) => props.theme.blue.lighter};
    color: white;
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 12px;
  }
`;

const GenreSelectorWrapper = styled.div`
  padding: 0 50px;
  margin-top: 40px;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
  @media (max-width: 400px) {
    padding: 0 20px;
  }
`;

const GenreSelectorTitle = styled.h3`
  font-size: 24px;
  color: ${(props) => props.theme.white.lighter};
  margin-bottom: 40px;
  letter-spacing: 2px;
  @media (max-width: 768px) {
    font-size: 22px;
    margin-bottom: 30px;
  }
`;

const GenreSelector = styled.div`
  display: flex;
  gap: 20px;

  button {
    padding: 10px 20px;
    font-size: 20px;
    border: none;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    color: ${(props) => props.theme.white.lighter};
    cursor: pointer;

    @media (max-width: 768px) {
      flex-wrap: wrap;
      font-size: 14px;
    }

    &:hover {
      background: ${(props) => props.theme.blue.darker};
    }
  }
`;

const slideTitles = [
  "회원님을 위한 오늘의 추천 콘텐츠",
  "주말 정복 필수 리스트",
  "지금 뜨고 있는 콘텐츠",
  "어워드 수상 콘텐츠",
];

// 리모컨 이벤트 키 설정
const REMOTE_KEYS = {
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
  ENTER: "Enter",
};

const Home = () => {
  const { data, isLoading } = useQuery<GetMoviesResult>({
    queryKey: ["nowPlaying"],
    queryFn: getMovies,
  });

  const history = useNavigate();

  const [selectedGenre, setSelectedGenre] = useState<string | null>("28");

  const sliderRef = useRef<Slider | null>(null);

  const [isDelayedLoading, setIsDelayedLoading] = useState<boolean>(true);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case REMOTE_KEYS.RIGHT:
        sliderRef.current?.slickNext();
        break;
      case REMOTE_KEYS.LEFT:
        sliderRef.current?.slickPrev();
        break;
      default:
        break;
    }
  };

  const filteredMovies = selectedGenre
    ? data?.results.filter((movie) =>
        movie.genre_ids.includes(parseInt(selectedGenre))
      )
    : null;

  const genres = [
    { id: "28", label: "액션" },
    { id: "35", label: "코미디" },
    { id: "18", label: "드라마" },
    { id: "27", label: "공포" },
  ];

  // 상세 페이지 이동
  const onDetail = (movieId: number) => {
    history(`/movies/${movieId}`);
  };

  //슬라이드 설정
  const settings = {
    infinite: true, // 무한 루프
    speed: 1000, // 슬라이드 전환 속도
    slidesToShow: 1, // 한 번에 1개의 슬라이드만 표시
    slidesToScroll: 1, // 한 번에 이동할 슬라이드 수
    autoplay: true, // 자동 재생
    autoplaySpeed: 5000, // 자동 재생 속도
    centerMode: true, // 중앙 정렬
    centerPadding: "2%", // 양쪽 슬라이드가 살짝 보이도록 설정
    arrows: false,
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsDelayedLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const isCurrentlyLoading = isLoading || isDelayedLoading;

  return (
    <>
      <Helmet>
        <title>ViVaPlay</title>
        <meta property="og:title" content="영화의 즐거움을 담아, VIVA Play" />
        <meta
          property="og:description"
          content="즐거움이 가득한 VIVA Play에서 다양한 영화를 만나보세요"
        />
        <meta
          property="og:image"
          content={`${process.env.PUBLIC_URL}/vivamain.png`}
        />
      </Helmet>
      <Container>
        {isCurrentlyLoading ? (
          <Loader>
            <Loading />
          </Loader>
        ) : (
          <>
            {data?.results[0] && (
              <>
                <div
                  tabIndex={0}
                  onKeyDown={handleKeyDown}
                  style={{ outline: "none" }}
                >
                  <Slider ref={sliderRef} {...settings}>
                    {data.results.slice(0, 5).map((movie) => (
                      <div key={movie.id}>
                        <Banner
                          $bgPhoto={
                            movie.backdrop_path
                              ? makeImagePath(movie.backdrop_path)
                              : "movie.jpg"
                          }
                        >
                          <Title>{movie.original_title}</Title>
                          <Overview>{movie.overview}</Overview>
                          <ButtonGroup>
                            <BannerButton
                              tabIndex={0}
                              onClick={() => onDetail(movie.id)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && onDetail(movie.id)
                              }
                            >
                              ▶ 더보기
                            </BannerButton>
                          </ButtonGroup>
                        </Banner>
                      </div>
                    ))}
                  </Slider>
                </div>
                <GenreSelectorWrapper>
                  <GenreSelectorTitle>
                    비바플레이에서 추천하는 프로그램은?
                  </GenreSelectorTitle>
                  <GenreSelector tabIndex={0}>
                    {genres.map((genre) => (
                      <button
                        key={genre.id}
                        tabIndex={0}
                        onClick={() => setSelectedGenre(genre.id)}
                      >
                        {genre.label}
                      </button>
                    ))}
                  </GenreSelector>
                  ;
                </GenreSelectorWrapper>
              </>
            )}

            {selectedGenre && filteredMovies && (
              <SliderComponent
                movies={filteredMovies}
                title={` 오늘의 ${
                  {
                    "28": "액션을",
                    "35": "코미디를",
                    "18": "드라마를",
                    "27": "공포를",
                  }[selectedGenre]
                } 추천합니다`}
              />
            )}
            {data && <TopSlider />}
            {data &&
              slideTitles.map((title, idx) => {
                const start = idx * 6;
                const end = start + 6;
                const sliderMovies =
                  data.results.length >= end
                    ? data.results.slice(start, end)
                    : data.results.slice(start);

                return (
                  <SliderComponent
                    key={idx}
                    movies={sliderMovies}
                    title={title}
                  />
                );
              })}
          </>
        )}
      </Container>
    </>
  );
};

export default Home;
