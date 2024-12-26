import { getVideos, getIdDetaile, IdMovie } from "../api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import YouTube from "react-youtube";
import styled from "styled-components";
import DtailCastSlide from "../components/Detail/DtailCastSlide";
import RandomMovieSlide from "../components/Detail/RandomMovieSlide";
import DetailMovieRight from "../components/Detail/DetailMovieRight";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { Helmet } from "react-helmet";
import { makeImagePath } from "../utils/utils";

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
  height: 1005;
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
  height: 400px;
  background-color: ${({ theme }) => theme.black.lighter};
  border-radius: 16px;
  padding: 40px 60px;
`;

const RandomMoviewrap = styled.div`
  width: 100%;
  /* height: 100%; */
  height: 400px;
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
  const [, setIsLoggedIn] = useState<boolean>(false); //로그인 여부
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

  // 로컬스토리지 확인
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUsers = localStorage.getItem("users");
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    // storage 이벤트 리스너 등록
    window.addEventListener("storage", handleStorageChange);

    // 초기 로드 시 상태 확인
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  //영화 id 데이터
  const { data: nowMovie, isLoading } = useQuery<IdMovie>({
    queryKey: ["movieData", movieId],
    queryFn: async () => {
      if (!movieId) return { movie: 0 };
      return await getIdDetaile(movieId);
    },
  });

  // 영화 유투브
  const { data: video } = useQuery({
    queryKey: ["video", movieId],
    queryFn: async () => {
      if (!movieId) return { results: [] };
      return await getVideos(movieId);
    },
  });

  return (
    <>
      <Helmet>
        <title>{`${nowMovie?.title}_ViVaPlay`}</title>
        <meta property="og:title" content={`${nowMovie?.title},ViVaPlay`} />
        <meta property="og:description" content={`${nowMovie?.overview}`} />
        <meta
          property="og:image"
          content={nowMovie ? makeImagePath(nowMovie.backdrop_path) : ""}
        />
      </Helmet>
      <Container>
        {isLoading ? (
          <Loader>
            <Loading />
          </Loader>
        ) : (
          <>
            <Inner>
              <Left>
                <MovieWrap>
                  <YouTube videoId={video?.results?.[0]?.key || ""} />
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
                  <RandomMovieSlide
                    reSize={reSize}
                    middleSize={middleSize}
                    type={"Detail"}
                  />
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
    </>
  );
};

export default Detail;
