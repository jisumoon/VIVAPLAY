import { Outlet, useLocation } from "react-router-dom";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import theme from "./theme";
import styled from "styled-components";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MobileHeader from "./components/MobileHeader";
import Header from "./components/Main/Header";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Pretendard-Regular';
    src: url('https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
    font-weight: 400;
    font-style: normal;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  ul, li {
    list-style: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  body {
    font-family: 'Pretendard-Regular';
    background: ${(props) => props.theme.black.lighter};
  }

`;

const MobileHeaderWrapper = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const DesktopHeaderWrapper = styled.div`
  display: none;

  @media (min-width: 769px) {
    display: block;
  }
`;

const App = () => {
  const location = useLocation();
  const hiddenRoutes = ["/login", "/join"];
  const hideHeader = hiddenRoutes.includes(location.pathname);

  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {!hideHeader && (
          <>
            <DesktopHeaderWrapper>
              <Header />
            </DesktopHeaderWrapper>

            <MobileHeaderWrapper>
              <MobileHeader />
            </MobileHeaderWrapper>
          </>
        )}
        <Outlet />
      </ThemeProvider>
    </>
  );
};

export default App;
