import { Route, Switch } from "react-router-dom";
import Layout from "./components/Layout";
import UserListPage from "./features/users/pages/UserListPage";
import { HooksPracticePage } from "./practice/hooks";
import UserFormPage from "./features/users/pages/UserFormPage";

function App() {
  return (
    <Layout>
      <Switch>
        <Route exact path="/" component={UserListPage} />
        <Route exact path="/users/new" component={UserFormPage} />
        <Route exact path="/users/:id/edit" component={UserFormPage} />
        <Route path="/practice/hooks" component={HooksPracticePage} />
      </Switch>
    </Layout>
  );
}

export default App;
