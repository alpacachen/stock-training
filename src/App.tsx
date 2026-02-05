import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { TrainingPage } from './pages/TrainingPage';

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/training" component={TrainingPage} />
      <Route>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">404</h1>
            <p className="text-muted">页面未找到</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default App;
