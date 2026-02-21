import { Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import UserListPage from "./features/users/pages/UserListPage";

const UserFormPage = () => <h2>ユーザー登録ページ</h2>;

function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/" component={UserListPage} />
        <Route exact path="/user/new" component={UserFormPage} />
      </Switch>
    </Layout>
  );
}

export default App;
