import React, { useState, useEffect, useRef } from 'react';
import { Play, Trophy, Users, BookOpen, RotateCcw, ChevronRight, X, Check, Plus, Minus, Home, Shuffle } from 'lucide-react';
import { WORD_BANK } from './words.js';

const STORAGE_KEY = 'hat_game_state_v1';
const SETTINGS_KEY = 'hat_game_settings_v1';

// ============ УТИЛИТЫ ============
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Безопасное чтение/запись localStorage
const storage = {
  get(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
};

// ============ ЭКРАН: НАСТРОЙКА ============
const SetupScreen = ({ onStart, initial }) => {
  const [players, setPlayers] = useState(initial?.players || ['', '', '', '']);
  const [difficulty, setDifficulty] = useState(initial?.difficulty || 'medium');
  const [wordCount, setWordCount] = useState(initial?.wordCount || 30);
  const [roundTime, setRoundTime] = useState(initial?.roundTime || 60);
  const [pairingMode, setPairingMode] = useState(initial?.pairingMode || 'random');
  const [error, setError] = useState('');

  const addPlayer = () => {
    if (players.length < 12) setPlayers([...players, '']);
  };

  const removePlayer = (idx) => {
    if (players.length > 4) setPlayers(players.filter((_, i) => i !== idx));
  };

  const updatePlayer = (idx, val) => {
    const next = [...players];
    next[idx] = val;
    setPlayers(next);
  };

  const handleStart = () => {
    const cleaned = players.map(p => p.trim()).filter(Boolean);
    if (cleaned.length < 4) {
      setError('Нужно минимум 4 игрока');
      return;
    }
    if (cleaned.length % 2 !== 0) {
      setError('Игроков должно быть чётное количество');
      return;
    }
    const names = new Set(cleaned.map(n => n.toLowerCase()));
    if (names.size !== cleaned.length) {
      setError('Имена не должны повторяться');
      return;
    }
    setError('');
    onStart({ players: cleaned, difficulty, wordCount, roundTime, pairingMode });
  };

  const diffLabels = {
    kids: { label: 'Детский', desc: 'Мультфильмы, сказки, детские книги' },
    easy: { label: 'Лёгкий', desc: 'Бытовые предметы и понятия' },
    medium: { label: 'Средний', desc: 'Абстракции, эмоции, профессии' },
    hard: { label: 'Сложный', desc: 'Философия, наука, термины' }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 px-5 py-8 pb-32">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <ellipse cx="50" cy="78" rx="42" ry="6" fill="#1c1917"/>
              <path d="M 22 78 Q 22 30 50 28 Q 78 30 78 78 Z" fill="#1c1917"/>
              <rect x="22" y="68" width="56" height="4" fill="#7c2d12"/>
            </svg>
          </div>
          <h1 className="text-4xl font-serif tracking-tight text-stone-900">Шляпа</h1>
          <p className="text-stone-500 text-sm mt-1 tracking-wider uppercase">Игра в слова</p>
        </div>

        {/* ИГРОКИ */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-stone-600" />
              <h2 className="font-medium text-stone-900">Игроки</h2>
            </div>
            <span className="text-sm text-stone-500">{players.length} чел.</span>
          </div>
          <div className="space-y-2">
            {players.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-7 text-center text-sm text-stone-400 font-mono">{idx + 1}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updatePlayer(idx, e.target.value)}
                  placeholder={`Игрок ${idx + 1}`}
                  className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                  maxLength={20}
                />
                {players.length > 4 && (
                  <button
                    onClick={() => removePlayer(idx)}
                    className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-red-600 transition-colors"
                    aria-label="Удалить игрока"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {players.length < 12 && (
            <button
              onClick={addPlayer}
              className="mt-3 w-full py-2.5 border border-dashed border-stone-300 rounded-lg text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={16} /> Добавить игрока
            </button>
          )}
        </div>

        {/* СЛОЖНОСТЬ */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-stone-600" />
            <h2 className="font-medium text-stone-900">Категория слов</h2>
          </div>
          <div className="space-y-2">
            {Object.entries(diffLabels).map(([key, { label, desc }]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  difficulty === key
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
                }`}
              >
                <div className="font-medium">{label}</div>
                <div className={`text-xs mt-0.5 ${difficulty === key ? 'text-stone-300' : 'text-stone-500'}`}>{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* РАЗБИЕНИЕ НА ПАРЫ */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Shuffle size={18} className="text-stone-600" />
            <h2 className="font-medium text-stone-900">Разбиение на пары</h2>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setPairingMode('random')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                pairingMode === 'random'
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
              }`}
            >
              <div className="font-medium">Случайно</div>
              <div className={`text-xs mt-0.5 ${pairingMode === 'random' ? 'text-stone-300' : 'text-stone-500'}`}>Игроки автоматически разобьются на пары</div>
            </button>
            <button
              onClick={() => setPairingMode('manual')}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                pairingMode === 'manual'
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
              }`}
            >
              <div className="font-medium">Выбрать вручную</div>
              <div className={`text-xs mt-0.5 ${pairingMode === 'manual' ? 'text-stone-300' : 'text-stone-500'}`}>Самим решить, кто с кем играет</div>
            </button>
          </div>
        </div>

        {/* ПАРАМЕТРЫ */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-900">Слов в игре</span>
                <span className="text-lg font-mono font-medium text-stone-900">{wordCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setWordCount(Math.max(10, wordCount - 5))}
                  className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100"
                  aria-label="Уменьшить количество слов"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="flex-1 accent-stone-900"
                />
                <button
                  onClick={() => setWordCount(Math.min(100, wordCount + 5))}
                  className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100"
                  aria-label="Увеличить количество слов"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-stone-900">Длительность раунда</span>
                <span className="text-lg font-mono font-medium text-stone-900">{roundTime} с</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRoundTime(Math.max(20, roundTime - 10))}
                  className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100"
                  aria-label="Уменьшить время"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="range"
                  min="20"
                  max="120"
                  step="10"
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="flex-1 accent-stone-900"
                />
                <button
                  onClick={() => setRoundTime(Math.min(120, roundTime + 10))}
                  className="w-9 h-9 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-100"
                  aria-label="Увеличить время"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full py-4 bg-stone-900 text-white rounded-2xl font-medium text-lg hover:bg-stone-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-stone-900/10"
        >
          Начать игру <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

// ============ ЭКРАН: РУЧНОЙ ВЫБОР ПАР ============
const PairingScreen = ({ players, onConfirm, onBack }) => {
  // pairs: массив пар, каждая — [имя1, имя2]
  // selected: имя игрока, выбранного первым (ждём второго)
  const [pairs, setPairs] = useState([]);
  const [selected, setSelected] = useState(null);

  const allPaired = new Set(pairs.flat());
  const unpaired = players.filter(p => !allPaired.has(p));

  const handleTap = (name) => {
    // Если игрок уже в паре — разорвать эту пару (вернуть в пул)
    if (allPaired.has(name)) {
      setPairs(pairs.filter(pair => !pair.includes(name)));
      setSelected(null);
      return;
    }
    // Если он же был выбран первым — отменить выбор
    if (selected === name) {
      setSelected(null);
      return;
    }
    // Если уже есть первый — формируем пару
    if (selected) {
      setPairs([...pairs, [selected, name]]);
      setSelected(null);
    } else {
      setSelected(name);
    }
  };

  const handleAutoPair = () => {
    // Случайно добивает оставшихся
    const shuffled = shuffle(unpaired);
    const newPairs = [...pairs];
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      newPairs.push([shuffled[i], shuffled[i + 1]]);
    }
    setPairs(newPairs);
    setSelected(null);
  };

  const handleReset = () => {
    setPairs([]);
    setSelected(null);
  };

  const canConfirm = unpaired.length === 0;

  // Цвета фона для пар (циклично) — чтобы пары визуально отличались
  const pairColors = [
    'bg-amber-100 border-amber-300 text-amber-900',
    'bg-sky-100 border-sky-300 text-sky-900',
    'bg-emerald-100 border-emerald-300 text-emerald-900',
    'bg-rose-100 border-rose-300 text-rose-900',
    'bg-violet-100 border-violet-300 text-violet-900',
    'bg-orange-100 border-orange-300 text-orange-900'
  ];
  const pairIndexOf = (name) => pairs.findIndex(pair => pair.includes(name));

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 px-5 py-8 pb-32">
      <div className="max-w-md mx-auto">
        <button
          onClick={onBack}
          className="text-sm text-stone-500 mb-4 flex items-center gap-1 hover:text-stone-900"
        >
          ← Назад к настройкам
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif text-stone-900 mb-1">Соберите пары</h1>
          <p className="text-stone-500 text-sm">
            {selected
              ? `Выбран ${selected}. Тапни на напарника.`
              : 'Тапни на двух игроков — они станут парой.'}
          </p>
        </div>

        {/* Карточки игроков */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {players.map((name) => {
            const pairIdx = pairIndexOf(name);
            const inPair = pairIdx !== -1;
            const isSelected = selected === name;
            const colorClass = inPair ? pairColors[pairIdx % pairColors.length] : '';
            return (
              <button
                key={name}
                onClick={() => handleTap(name)}
                className={`px-4 py-4 rounded-xl border-2 transition-all active:scale-95 text-center font-medium relative ${
                  inPair
                    ? colorClass
                    : isSelected
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
                }`}
              >
                {inPair && (
                  <div className="absolute top-1 right-1.5 text-[10px] font-mono opacity-60">
                    Пара {pairIdx + 1}
                  </div>
                )}
                <div className="break-words">{name}</div>
              </button>
            );
          })}
        </div>

        {/* Список сформированных пар */}
        {pairs.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4 mb-5">
            <div className="text-xs text-stone-500 uppercase tracking-wider mb-3">Пары ({pairs.length})</div>
            <div className="space-y-2">
              {pairs.map((pair, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${pairColors[idx % pairColors.length]}`}>
                    {idx + 1}
                  </div>
                  <span className="font-medium">{pair[0]}</span>
                  <span className="text-stone-400">·</span>
                  <span className="font-medium">{pair[1]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Вспомогательные кнопки */}
        <div className="flex gap-2 mb-4">
          {unpaired.length >= 2 && (
            <button
              onClick={handleAutoPair}
              className="flex-1 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 hover:border-stone-400 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Shuffle size={14} /> Добить случайно
            </button>
          )}
          {pairs.length > 0 && (
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 hover:border-stone-400 active:scale-[0.98] transition-all"
            >
              Сбросить
            </button>
          )}
        </div>

        <button
          onClick={() => onConfirm(pairs)}
          disabled={!canConfirm}
          className={`w-full py-4 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-2 ${
            canConfirm
              ? 'bg-stone-900 text-white active:scale-[0.99] shadow-lg shadow-stone-900/10'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {canConfirm
            ? <>Начать игру <ChevronRight size={20} /></>
            : `Осталось распределить: ${unpaired.length}`}
        </button>

        <p className="text-center text-xs text-stone-400 mt-4 leading-relaxed">
          Тап по игроку в паре — разорвать пару и вернуть его обратно.
        </p>
      </div>
    </div>
  );
};

// ============ ДИАЛОГ ПОДТВЕРЖДЕНИЯ ВЫХОДА ============
const ExitConfirmDialog = ({ onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-medium text-stone-900 mb-2">Закончить игру?</h3>
        <p className="text-stone-600 text-sm mb-6 leading-relaxed">
          Текущий счёт не сохранится. Ты вернёшься на главный экран.
        </p>
        <div className="space-y-2">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 bg-stone-900 text-white rounded-xl font-medium active:scale-[0.99] transition-all"
          >
            Закончить и выйти
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3.5 bg-stone-100 text-stone-900 rounded-xl font-medium active:scale-[0.99] transition-all"
          >
            Продолжить игру
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ ЭКРАН: МЕЖДУ РАУНДАМИ ============
const RoundIntroScreen = ({ game, onStartRound, onExit }) => {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const turn = game.turns[game.currentTurn];
  const explainer = game.players[turn.explainerIdx];
  const guesser = game.players[turn.guesserIdx];
  const remainingWords = game.words.length - game.usedWords.length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 px-5 py-8">
      {showExitDialog && (
        <ExitConfirmDialog
          onConfirm={onExit}
          onCancel={() => setShowExitDialog(false)}
        />
      )}
      <div className="max-w-md mx-auto">
        {/* Кнопка выхода на главный экран */}
        <div className="flex justify-end mb-4 -mt-2">
          <button
            onClick={() => setShowExitDialog(true)}
            className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:border-stone-400 active:scale-95 transition-all"
            aria-label="Выйти на главный экран"
          >
            <Home size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {game.teams.map((team, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 border-2 ${
                idx === turn.teamIdx
                  ? 'border-stone-900 bg-white'
                  : 'border-transparent bg-stone-100'
              }`}
            >
              <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Пара {idx + 1}</div>
              <div className="text-sm font-medium truncate">{team.players.join(' · ')}</div>
              <div className="text-2xl font-mono font-medium mt-1">{team.score}</div>
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="text-stone-500 text-sm uppercase tracking-wider mb-3">Раунд {game.currentTurn + 1}</div>
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="mb-5">
              <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Объясняет</div>
              <div className="text-2xl font-medium text-stone-900">{explainer}</div>
            </div>
            <div className="h-px bg-stone-200 my-4" />
            <div>
              <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">Угадывает</div>
              <div className="text-2xl font-medium text-stone-900">{guesser}</div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6 text-sm text-stone-500">
          Осталось слов в шляпе: <span className="font-mono text-stone-900">{remainingWords}</span>
        </div>

        <button
          onClick={onStartRound}
          className="w-full py-5 bg-stone-900 text-white rounded-2xl font-medium text-xl active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-lg shadow-stone-900/10"
        >
          <Play size={22} fill="white" /> Поехали
        </button>

        <p className="text-center text-xs text-stone-400 mt-6 leading-relaxed">
          Объясняй слово любыми способами, кроме однокоренных.<br/>
          Пропускать слова нельзя — если не знаешь, раунд закончится.
        </p>
      </div>
    </div>
  );
};

// ============ ЭКРАН: ИГРОВОЙ РАУНД ============
const PlayingScreen = ({ game, onRoundEnd }) => {
  const [timeLeft, setTimeLeft] = useState(game.roundTime);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [guessedThisRound, setGuessedThisRound] = useState([]);
  const [flashGreen, setFlashGreen] = useState(false);
  const [endedReason, setEndedReason] = useState(null);

  const roundWordsRef = useRef(null);
  if (roundWordsRef.current === null) {
    const remaining = game.words.filter(w => !game.usedWords.includes(w));
    roundWordsRef.current = shuffle(remaining);
  }
  const roundWords = roundWordsRef.current;
  const currentWord = roundWords[currentWordIdx];

  useEffect(() => {
    if (endedReason) return;
    if (timeLeft <= 0) {
      setEndedReason('time');
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, endedReason]);

  // Звуковой сигнал на последних 5 секундах
  useEffect(() => {
    if (endedReason) return;
    if (timeLeft > 0 && timeLeft <= 5) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } catch (e) {}
    }
  }, [timeLeft, endedReason]);

  useEffect(() => {
    if (endedReason) {
      const timer = setTimeout(() => {
        onRoundEnd({ guessedWords: guessedThisRound, reason: endedReason });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [endedReason]);

  const handleGuessed = () => {
    if (endedReason) return;
    setFlashGreen(true);
    setTimeout(() => setFlashGreen(false), 400);

    const newGuessed = [...guessedThisRound, currentWord];
    setGuessedThisRound(newGuessed);

    if (currentWordIdx + 1 >= roundWords.length) {
      setEndedReason('out_of_words');
    } else {
      setCurrentWordIdx(currentWordIdx + 1);
    }
  };

  const handleGiveUp = () => {
    if (endedReason) return;
    setEndedReason('gave_up');
  };

  const timePercent = (timeLeft / game.roundTime) * 100;
  const isUrgent = timeLeft <= 5;

  if (endedReason) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-stone-500 text-sm uppercase tracking-wider mb-2">Раунд окончен</div>
          <div className="text-5xl font-mono font-medium text-stone-900 mb-4">+{guessedThisRound.length}</div>
          <div className="text-stone-600">
            {endedReason === 'time' && 'Время вышло'}
            {endedReason === 'gave_up' && 'Слово не объяснено'}
            {endedReason === 'out_of_words' && 'Слова в шляпе закончились!'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-200 ${
      flashGreen ? 'bg-green-500' : 'bg-stone-50'
    }`}>
      <div className={`absolute inset-0 bg-green-500 pointer-events-none transition-opacity duration-200 ${
        flashGreen ? 'opacity-100' : 'opacity-0'
      }`} />

      <div className="relative z-10 min-h-screen flex flex-col px-5 py-6">
        <div className="max-w-md mx-auto w-full">
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isUrgent ? 'bg-red-500' : 'bg-stone-900'
              }`}
              style={{ width: `${timePercent}%` }}
            />
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-mono font-medium tabular-nums leading-none ${
                isUrgent ? 'text-red-600' : 'text-stone-900'
              }`}>
                {timeLeft}
              </span>
              <span className={`text-base ${isUrgent ? 'text-red-500' : 'text-stone-500'}`}>
                сек
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono font-medium text-stone-900">+{guessedThisRound.length}</div>
              <div className="text-xs text-stone-500 uppercase tracking-wider">в раунде</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center max-w-md mx-auto w-full">
          <div className={`w-full bg-white rounded-3xl border-2 p-8 py-12 text-center transition-all ${
            flashGreen ? 'border-green-500 scale-105' : 'border-stone-900'
          }`}>
            <div className="text-stone-500 text-xs uppercase tracking-wider mb-4">Объясни слово</div>
            <div className={`font-serif text-4xl md:text-5xl font-medium leading-tight break-words transition-colors ${
              flashGreen ? 'text-green-700' : 'text-stone-900'
            }`}>
              {currentWord}
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto w-full space-y-3 pt-6">
          <button
            onClick={handleGuessed}
            className="w-full py-5 bg-green-600 text-white rounded-2xl font-medium text-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
          >
            <Check size={24} strokeWidth={3} /> Угадал
          </button>
          <button
            onClick={handleGiveUp}
            className="w-full py-3 bg-transparent text-stone-500 rounded-2xl font-medium text-sm border border-stone-300 active:scale-[0.99] transition-all"
          >
            Не могу объяснить — закончить раунд
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ ЭКРАН: ИТОГИ ============
const ResultsScreen = ({ game, onNewGame, onPlayAgainSameSettings }) => {
  const sorted = [...game.teams].map((t, i) => ({ ...t, originalIdx: i })).sort((a, b) => b.score - a.score);
  const maxScore = sorted[0].score;
  const winners = sorted.filter(t => t.score === maxScore);

  return (
    <div className="min-h-screen bg-stone-50 px-5 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <Trophy size={56} className="mx-auto text-amber-500 mb-4" />
          <h1 className="text-4xl font-serif text-stone-900 mb-2">Игра окончена</h1>
          <p className="text-stone-600">
            {winners.length === 1 ? 'Победила пара:' : 'Ничья между парами:'}
          </p>
          <div className="text-2xl font-medium text-stone-900 mt-2">
            {winners.map(w => w.players.join(' и ')).join(', ')}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {sorted.map((team, rank) => (
            <div
              key={team.originalIdx}
              className={`rounded-2xl p-5 border-2 ${
                rank === 0
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-medium ${
                    rank === 0 ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {rank + 1}
                  </div>
                  <div>
                    <div className="font-medium text-stone-900">{team.players.join(' и ')}</div>
                    <div className="text-xs text-stone-500 uppercase tracking-wider">Пара {team.originalIdx + 1}</div>
                  </div>
                </div>
                <div className="text-3xl font-mono font-medium text-stone-900">{team.score}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgainSameSettings}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-medium text-lg active:scale-[0.99] transition-all"
          >
            Сыграть ещё раз
          </button>
          <button
            onClick={onNewGame}
            className="w-full py-4 bg-white text-stone-900 rounded-2xl font-medium text-lg border border-stone-300 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} /> Новая игра с другими настройками
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ ГЛАВНЫЙ КОМПОНЕНТ ============
export default function App() {
  const [screen, setScreen] = useState('setup');
  const [game, setGame] = useState(null);
  const [savedSettings, setSavedSettings] = useState(null);
  const [pendingSettings, setPendingSettings] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = storage.get(STORAGE_KEY);
    if (saved && saved.screen && saved.game) {
      setGame(saved.game);
      setScreen(saved.screen);
    }
    const s = storage.get(SETTINGS_KEY);
    if (s) setSavedSettings(s);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (game && screen !== 'setup') {
      storage.set(STORAGE_KEY, { screen, game });
    } else {
      storage.remove(STORAGE_KEY);
    }
  }, [game, screen, loaded]);

  const buildTurnsOrder = (teams) => {
    const turns = [];
    const maxRounds = 100;
    for (let round = 0; round < maxRounds; round++) {
      const playerInPair = round % 2;
      for (let t = 0; t < teams.length; t++) {
        const explainerIdx = teams[t].playerIndices[playerInPair];
        const guesserIdx = teams[t].playerIndices[1 - playerInPair];
        turns.push({ teamIdx: t, explainerIdx, guesserIdx });
      }
    }
    return turns;
  };

  const handleStartGame = (settings) => {
    storage.set(SETTINGS_KEY, {
      players: settings.players,
      difficulty: settings.difficulty,
      wordCount: settings.wordCount,
      roundTime: settings.roundTime,
      pairingMode: settings.pairingMode
    });

    if (settings.pairingMode === 'manual') {
      // Сохраняем настройки и переходим на экран выбора пар
      setPendingSettings(settings);
      setScreen('pairing');
    } else {
      // Случайное разбиение — стартуем сразу
      const shuffled = shuffle(settings.players);
      const pairs = [];
      for (let i = 0; i < shuffled.length; i += 2) {
        pairs.push([shuffled[i], shuffled[i + 1]]);
      }
      startGameWithPairs(settings, pairs);
    }
  };

  const startGameWithPairs = (settings, pairs) => {
    // Уникальные игроки в порядке появления в парах
    const playersOrdered = pairs.flat();
    const teams = pairs.map((pair, idx) => ({
      players: pair,
      playerIndices: [idx * 2, idx * 2 + 1],
      score: 0
    }));

    const pool = WORD_BANK[settings.difficulty];
    const words = shuffle(pool).slice(0, settings.wordCount);
    const turns = buildTurnsOrder(teams);

    setGame({
      players: playersOrdered,
      teams,
      words,
      usedWords: [],
      turns,
      currentTurn: 0,
      roundTime: settings.roundTime,
      difficulty: settings.difficulty,
      originalSettings: settings,
      originalPairs: pairs
    });
    setPendingSettings(null);
    setScreen('roundIntro');
  };

  const handlePairingConfirm = (pairs) => {
    if (pendingSettings) {
      startGameWithPairs(pendingSettings, pairs);
    }
  };

  const handlePairingBack = () => {
    setPendingSettings(null);
    setScreen('setup');
  };

  const handleStartRound = () => setScreen('playing');

  const handleRoundEnd = ({ guessedWords }) => {
    const turn = game.turns[game.currentTurn];
    const newTeams = game.teams.map((team, idx) =>
      idx === turn.teamIdx
        ? { ...team, score: team.score + guessedWords.length }
        : team
    );
    const newUsedWords = [...game.usedWords, ...guessedWords];
    const isGameOver = newUsedWords.length >= game.words.length;

    setGame({
      ...game,
      teams: newTeams,
      usedWords: newUsedWords,
      currentTurn: game.currentTurn + 1
    });
    setScreen(isGameOver ? 'results' : 'roundIntro');
  };

  const handleNewGame = () => {
    setGame(null);
    setScreen('setup');
    storage.remove(STORAGE_KEY);
  };

  const handlePlayAgainSameSettings = () => {
    if (game?.originalSettings && game?.originalPairs) {
      // Используем те же пары — не показываем экран выбора заново
      startGameWithPairs(game.originalSettings, game.originalPairs);
    } else if (game?.originalSettings) {
      handleStartGame(game.originalSettings);
    } else {
      handleNewGame();
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400">Загрузка...</div>
      </div>
    );
  }

  if (screen === 'setup') return <SetupScreen onStart={handleStartGame} initial={savedSettings} />;
  if (screen === 'pairing' && pendingSettings) {
    return <PairingScreen players={pendingSettings.players} onConfirm={handlePairingConfirm} onBack={handlePairingBack} />;
  }
  if (screen === 'roundIntro') return <RoundIntroScreen game={game} onStartRound={handleStartRound} onExit={handleNewGame} />;
  if (screen === 'playing') return <PlayingScreen game={game} onRoundEnd={handleRoundEnd} />;
  if (screen === 'results') return <ResultsScreen game={game} onNewGame={handleNewGame} onPlayAgainSameSettings={handlePlayAgainSameSettings} />;
  return null;
}
