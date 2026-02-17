import { Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";

const UserListPage = () => <h2>ユーザー一覧ページ</h2>;
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
