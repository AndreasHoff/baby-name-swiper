import './App.css';
import { CardStack } from './components/CardStack';
import { NameForm } from './components/NameForm';
import { NameListView } from './components/NameListView';
import { SwipeButtons } from './components/SwipeButtons';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-pink-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-extrabold mb-6">👶 Baby Name Swiper</h1>
      <CardStack />
      <SwipeButtons />
      <NameForm />
      <NameListView />
    </div>
  );
}

export default App;
