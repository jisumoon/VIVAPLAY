import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Movie, getMovies, getCertification } from "../api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { makeImagePath } from "../utils";
import Pagination from "react-js-pagination";

const Container = styled.div`
  width: 100%;
  padding: 30px;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const Title = styled.h2`
  color: white;
  margin-top: 100px;
  padding-left: 30px;
  margin-bottom: 40px;
  @media (max-width: 768px) {
    margin-top: 40px;
  }
`;

const Message = styled.div`
  color: ${(props) => props.theme.white.darker};
  font-size: 18px;
  padding-left: 30px;
  margin-top: 50px;
`;

const MovieGrid = styled.div`
  display: flex;
  padding-left: 30px;
  flex-wrap: wrap;
  gap: 40px;
  @media (max-width: 768px) {
    gap: 20px;
  }

  @media (max-width: 400px) {
    justify-content: space-between;
    padding: 0 20px;
  }
`;

const MovieCard = styled.div`
  width: 250px;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
  margin-bottom: 20px;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 400px) {
    width: 160px;
  }
`;

const MoviePoster = styled.div<{ $bgPhoto: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.$bgPhoto});
  background-size: cover;
  background-position: center;
  transition: transform 0.3s ease;
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
  backdrop-filter: blur(2px);

  div {
    display: flex;
    gap: 10px;
  }

  .title {
    font-size: 16px;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .age-restriction {
    font-size: 14px;
    padding: 2px 5px;
    color: white;
    border-radius: 4px;
    font-weight: bold;
    background: ${(props) => props.theme.blue.lighter};
  }
`;

const FavoriteIcon = styled(FontAwesomeIcon)<{ $isFavorite: boolean }>`
  color: ${(props) => (props.$isFavorite ? "#067FDA" : "#fff")};
  font-size: 20px;

  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const StyledPagination = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 100px;

  @media (max-width: 768px) {
    padding-top: 50px;
  }
  ul {
    display: flex;
    list-style: none;
    padding: 0;
    li {
      margin: 0 5px;
      a {
        color: ${(props) => props.theme.white.darker};
        padding: 5px 10px;
        border-radius: 5px;
        text-decoration: none;
        transition: background 0.3s;
        &:hover {
          background: ${(props) => props.theme.blue.darker};
        }
      }
      &.active a {
        background: ${(props) => props.theme.blue.darker};
        color: white;
      }
    }
  }
`;

const Love = () => {
  const [favoriteMovies, setFavoriteMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();
  const [certifications, setCertifications] = useState<Record<number, string>>(
    {}
  );
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 20;

  //즐겨찾기 데이터
  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      const savedFavorites = localStorage.getItem("favoriteMovies");
      if (savedFavorites) {
        const movieIds = JSON.parse(savedFavorites) as number[];
        const allMovies = await getMovies();
        const favorites = allMovies.results.filter((movie) =>
          movieIds.includes(movie.id)
        );
        setFavoriteMovies(favorites);
      }
    };

    fetchFavoriteMovies();
  }, []);

  //인증데이터
  useEffect(() => {
    const fetchCertifications = async () => {
      const results: Record<number, string> = {};
      for (const movie of favoriteMovies) {
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
  }, [favoriteMovies]);

  const handleMovieClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const toggleFavorite = (movieId: number) => {
    setFavoriteMovies((prevFavorites) => {
      const updatedFavorites = prevFavorites.filter(
        (movie) => movie.id !== movieId
      );
      localStorage.setItem(
        "favoriteMovies",
        JSON.stringify(updatedFavorites.map((movie) => movie.id))
      );
      return updatedFavorites;
    });
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container>
      <Title>내가 즐겨찾는 영화</Title>
      <div>
        {favoriteMovies.length > 0 ? (
          <MovieGrid>
            {favoriteMovies.map((movie) => (
              <MovieCard key={movie.id}>
                <MoviePoster
                  $bgPhoto={
                    movie.backdrop_path
                      ? makeImagePath(movie.backdrop_path)
                      : "/placeholder-image.jpg"
                  }
                  onClick={() => handleMovieClick(movie.id)}
                />
                <Overlay>
                  <div className="title">{movie.title}</div>
                  <div>
                    <div className="age-restriction">
                      {certifications[movie.id] || "15"}
                    </div>
                    <FavoriteIcon
                      icon={faHeart}
                      $isFavorite={true}
                      onClick={() => toggleFavorite(movie.id)}
                    />
                  </div>
                </Overlay>
              </MovieCard>
            ))}
          </MovieGrid>
        ) : (
          <Message>즐겨찾는 영화가 없습니다.</Message>
        )}
      </div>
      <StyledPagination>
        <Pagination
          activePage={currentPage}
          itemsCountPerPage={moviesPerPage}
          totalItemsCount={favoriteMovies.length}
          pageRangeDisplayed={5}
          onChange={handlePageChange}
        />
      </StyledPagination>
    </Container>
  );
};

export default Love;
