import { Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import UserListPage from "./features/users/pages/UserListPage";
import { HooksPracticePage } from "./practice/hooks";

const UserFormPage = () => <h2>ユーザー登録ページ</h2>;

function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/" component={UserListPage} />
        <Route exact path="/user/new" component={UserFormPage} />
        <Route path="/practice/hooks" component={HooksPracticePage} />
      </Switch>
    </Layout>
  );
}

export default App;
