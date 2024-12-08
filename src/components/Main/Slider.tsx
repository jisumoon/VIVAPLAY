import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Slider from "react-slick";
import { makeImagePath } from "../../utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getCertification, Movie } from "../../api";

interface SliderProps {
  movies: Movie[];
  title?: string;
  onClick?: (movieId: number) => void;
}

const Container = styled.div`
  position: relative;
  margin-top: 30px;
  overflow: hidden;
`;

const SliderTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 20px;
  color: ${(props) => props.theme.white.lighter};
  padding-left: 20px;
`;

const StyledSlider = styled(Slider)`
  .slick-slide {
    padding: 0 10px;
  }

  .slick-arrow {
    z-index: 10;
    width: 40px;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;

    &:before {
      display: none;
    }
  }

  .slick-prev {
    left: 0;
  }

  .slick-next {
    right: 0;
  }

  ${Container}:hover & .slick-arrow {
    opacity: 1;
  }
`;

const Box = styled.div<{ $bgPhoto: string }>`
  height: 160px;
  background: url(${(props) => props.$bgPhoto}) center/cover no-repeat;
  border-radius: 4px;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: scale(1.05);
    transition: transform 0.3s ease-in-out;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  color: ${(props) => props.theme.white.lighter};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  .title {
    font-size: 14px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .age-restriction {
    font-size: 12px;
    padding: 2px 5px;
    color: white;
    border-radius: 4px;
    font-weight: bold;
    background: ${(props) => props.theme.blue.lighter};
  }
`;

const Info = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 104%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;

  ${Box}:hover & {
    opacity: 1;
  }

  h4 {
    font-size: 18px;
    margin-bottom: 15px;
    font-weight: bold;
  }

  .info-buttons {
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
      font-size: 12px;
      cursor: pointer;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      padding: 10px;
      transition: all 0.3s ease;

      &:nth-of-type(1) {
        background: ${(props) => props.theme.blue.lighter};
        color: ${(props) => props.theme.white.lighter};
        &:hover {
          background: ${(props) => props.theme.blue.darker};
        }
      }

      &:nth-of-type(2) {
        border: 2px solid ${(props) => props.theme.white.darker};
        background: transparent;
        color: ${(props) => props.theme.white.lighter};
        &:hover {
          border-color: ${(props) => props.theme.blue.lighter};
        }
      }
    }
  }

  .info-rating {
    font-size: 14px;
    color: ${(props) => props.theme.white.darker};
    margin-top: 14px;
    text-align: left;
  }
`;

const SliderComponent: React.FC<SliderProps> = ({ movies, title }) => {
  const navigate = useNavigate();
  const [favoriteMovies, setFavoriteMovies] = useState<number[]>(() => {
    const savedFavorites = localStorage.getItem("favoriteMovies");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  );

  useEffect(() => {
    const fetchCertifications = async () => {
      const results: Record<number, string> = {};
      for (const movie of movies) {
        const data = await getCertification(movie.id);
        const krRelease = data.results.find(
          (release: any) => release.iso_3166_1 === "KR"
        );
        results[movie.id] =
          krRelease && krRelease.release_dates.length > 0
            ? krRelease.release_dates[0].certification || "15"
            : "15";
      }
      setCertifications(results);
    };

    fetchCertifications();
  }, [movies]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    centerMode: false,
    slidesToShow: 6,
    slidesToScroll: 1,

    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
    ],
  };

  const onDetail = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const toggleFavorite = (movieId: number) => {
    // 로컬스토리지에서 현재 즐겨찾기 데이터 가져오기
    const savedFavorites = localStorage.getItem("favoriteMovies");
    const movieIds = savedFavorites ? JSON.parse(savedFavorites) : [];

    // 상태와 로컬스토리지 업데이트
    const updatedFavorites = movieIds.includes(movieId)
      ? movieIds.filter((id: number) => id !== movieId) // 이미 있으면 삭제
      : [...movieIds, movieId]; // 없으면 추가

    // 로컬스토리지에 새 값 저장
    localStorage.setItem("favoriteMovies", JSON.stringify(updatedFavorites));

    // 상태 업데이트
    setFavoriteMovies(updatedFavorites);
  };

  if (!movies || movies.length === 0) {
    return <div>슬라이드에 표시할 영화가 없습니다.</div>;
  }

  return (
    <Container>
      {title && <SliderTitle>{title}</SliderTitle>}
      <StyledSlider {...settings}>
        {movies.map((movie) => (
          <Box
            key={movie.id}
            $bgPhoto={
              movie.backdrop_path
                ? makeImagePath(movie.backdrop_path)
                : "/placeholder-image.jpg"
            }
          >
            <Overlay>
              <div className="title">{movie.title}</div>
              <div className="age-restriction">
                {certifications[movie.id] || "15"}
              </div>
            </Overlay>
            <Info>
              <h4>{movie.title}</h4>
              <div className="info-buttons">
                <FontAwesomeIcon
                  icon={faPlay}
                  onClick={() => onDetail(movie.id)}
                />
                <FontAwesomeIcon
                  icon={faHeart}
                  onClick={() => toggleFavorite(movie.id)}
                  style={{
                    color: favoriteMovies.includes(movie.id)
                      ? "#067FDA"
                      : "white",
                  }}
                />
              </div>
              <div className="info-rating">
                ⭐ {movie.vote_average.toFixed(1)} / 10 | 👍
                {movie.vote_count.toLocaleString()} likes
              </div>
            </Info>
          </Box>
        ))}
      </StyledSlider>
    </Container>
  );
};

export default SliderComponent;
