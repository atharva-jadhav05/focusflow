import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './components/login';


function App() {

  return (
    <GoogleOAuthProvider clientId='356377434224-gv1sfl0pk97qbiu2v2ub0fmsh8mh3plj.apps.googleusercontent.com'>
    <div className="App">
      <LoginPage/>
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
