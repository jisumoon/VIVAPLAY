import {
  getVideos,
  getMovies,
  GetMoviesResult,
  getIdDetaile,
  IdMovie,
} from "../api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import YouTube from "react-youtube";
import styled from "styled-components";
import DtailCastSlide from "../components/DtailCastSlide";
import RandomMovieSlide from "../../src/components/Main/RandomMovieSlide";
import DetailMovieRight from "../components/DetailMovieRight";
import { useEffect, useState } from "react";

const Container = styled.div`
  background-color: ${(props) => props.theme.black.veryDark};
  width: 100%;
  height: 100%;
  padding: 40px 60px;
  @media screen and (max-width: 768px) {
    padding: 10px;
  }
`;
const Loader = styled.div``;

const Inner = styled.div`
  height: 100%;
  width: 100%;
  max-width: 1900px;
  padding: 60px 20px;
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 20px;
  margin: 0 auto;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 60px 0px;
  }
`;

const Left = styled.div`
  height: inherit;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Right = styled.div`
  height: inherit;
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const RightMobile = styled.div`
  height: inherit;
  display: none;
  @media screen and (max-width: 768px) {
    display: block;
  }
`;

const MovieWrap = styled.div`
  div:nth-child(1) {
    border-radius: 14px;
    overflow: hidden;
    height: 680px;
    width: 100%;
    @media screen and (max-width: 768px) {
      height: 400px;
      border-radius: 14px;
      overflow: hidden;
    }
    iframe:nth-child(1) {
      height: 100%;
      width: 100%;
    }
  }
`;

const Crewrap = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.black.lighter};
  border-radius: 16px;
  padding: 40px 60px;
`;

const RandomMoviewrap = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.black.lighter};
  border-radius: 16px;
  padding: 40px 60px;
`;

const Detail = () => {
  const movieId = Number(useParams<{ movieId: string }>().movieId?.trim());
  const [reSize, setReSize] = useState(window.innerWidth < 1200);
  const [middleSize, setMiddleSize] = useState(
    window.innerWidth < 1500 && window.innerWidth >= 1200
  );
  // const { movieId } = useParams<{ movieId: string }>();
  //반응형
  useEffect(() => {
    const handleResize = () => {
      setReSize(window.innerWidth < 1200);
      setMiddleSize(window.innerWidth < 1500 && window.innerWidth >= 1200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // //영화데이터들
  // const { data, isLoading } = useQuery<GetMoviesResult>({
  //   queryKey: ["nowMovie"],
  //   queryFn: getMovies,
  // });

  //영화 id 데이터
  const { data: nowMovie, isLoading } = useQuery<IdMovie>({
    queryKey: ["movieData", movieId],
    queryFn: async () => {
      if (!movieId) return { movie: 0 };
      return await getIdDetaile(movieId);
    },
  });
  // console.log("movieId", movieId);
  console.log("nowMovie", nowMovie);
  // const nowMovieId = nowMovie?.id;
  // //해당영화정보
  // const nowMovie = data?.results.filter(
  //   (movie) => movie.id === Number(movieId)
  // )[0];

  //해당영화 id
  // const nowMovieId = data?.results.filter(
  //   (movie) => String(movie.id) === movieId
  // )[0].id;

  // 영화 유투브
  const { data: video, isLoading: videoLoding } = useQuery({
    queryKey: ["video", movieId],
    queryFn: async () => {
      if (!movieId) return { results: [] };
      return await getVideos(movieId);
    },
  });

  return (
    <Container>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Inner>
            <Left>
              <MovieWrap>
                {videoLoding ? (
                  <Loader>Loading...</Loader>
                ) : (
                  <YouTube videoId={video?.results?.[0]?.key || ""} />
                )}
              </MovieWrap>
              <RightMobile>
                <DetailMovieRight
                  reSize={reSize}
                  nowMovie={nowMovie}
                  nowMovieId={movieId}
                />
              </RightMobile>
              <Crewrap>
                <DtailCastSlide
                  reSize={reSize}
                  middleSize={middleSize}
                  nowMovieId={movieId}
                />
              </Crewrap>
              <RandomMoviewrap>
                <RandomMovieSlide reSize={reSize} middleSize={middleSize} />
              </RandomMoviewrap>
            </Left>
            <Right>
              <DetailMovieRight
                reSize={reSize}
                nowMovie={nowMovie}
                nowMovieId={movieId}
              />
            </Right>
          </Inner>
        </>
      )}
    </Container>
  );
};

export default Detail;
