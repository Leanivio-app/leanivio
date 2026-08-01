'use client';

import { useMemo, useState } from 'react';

const initial = {
  unit: 'us', sex: 'male', age: 30, feet: 5, inches: 10, heightCm: 178,
  weightLb: 198, weightKg: 90, goalLb: 176, goalKg: 80,
  activity: '1.375', preference: 'halal', budget: 'standard', meals: '3',
  allergies: '', dislikes: '', cookingTime: '30', store: 'any'
};

const activityLabels = {
  '1.2': 'Mostly sedentary',
  '1.375': 'Lightly active',
  '1.55': 'Moderately active',
  '1.725': 'Very active'
};

const mealLibraries = {
  halal: [
    ['Breakfast', 'Egg & spinach breakfast wrap', 410],
    ['Lunch', 'Chicken shawarma rice bowl', 560],
    ['Snack', 'Greek yogurt with berries', 220],
    ['Dinner', 'Baked salmon, potatoes & salad', 610]
  ],
  mediterranean: [
    ['Breakfast', 'Greek yogurt, oats & walnuts', 420],
    ['Lunch', 'Mediterranean chicken grain bowl', 550],
    ['Snack', 'Apple with almond butter', 210],
    ['Dinner', 'Salmon, couscous & roasted vegetables', 620]
  ],
  vegetarian: [
    ['Breakfast', 'Protein oats with berries', 420],
    ['Lunch', 'Chickpea quinoa bowl', 540],
    ['Snack', 'Cottage cheese and fruit', 220],
    ['Dinner', 'Tofu stir-fry with brown rice', 610]
  ],
  vegan: [
    ['Breakfast', 'Chia overnight oats', 410],
    ['Lunch', 'Lentil quinoa power bowl', 550],
    ['Snack', 'Fruit and pumpkin seeds', 210],
    ['Dinner', 'Tofu vegetable stir-fry', 620]
  ],
  keto: [
    ['Breakfast', 'Eggs, avocado & tomatoes', 430],
    ['Lunch', 'Chicken Caesar salad, no croutons', 520],
    ['Snack', 'Cheese, cucumber & olives', 230],
    ['Dinner', 'Salmon with roasted broccoli', 640]
  ],
  'no-preference': [
    ['Breakfast', 'Protein oats with berries', 410],
    ['Lunch', 'Chicken rice bowl with vegetables', 560],
    ['Snack', 'Greek yogurt and fruit', 220],
    ['Dinner', 'Salmon, potatoes & salad', 610]
  ]
};

function measurements(data) {
  const heightCm = data.unit === 'us'
    ? (Number(data.feet) * 12 + Number(data.inches)) * 2.54
    : Number(data.heightCm);
  const weightKg = data.unit === 'us' ? Number(data.weightLb) * 0.453592 : Number(data.weightKg);
  const goalKg = data.unit === 'us' ? Number(data.goalLb) * 0.453592 : Number(data.goalKg);
  return { heightCm, weightKg, goalKg };
}

function estimatePlan(data) {
  const { heightCm, weightKg, goalKg } = measurements(data);
  const age = Number(data.age);
  const sexOffset = data.sex === 'male' ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const maintenance = Math.round(bmr * Number(data.activity));
  const deficit = maintenance > 2600 ? 600 : 450;
  const minimum = data.sex === 'male' ? 1500 : 1200;
  const target = Math.max(minimum, maintenance - deficit);
  const protein = Math.round(Math.min(2.0 * weightKg, 190));
  const fat = Math.round((target * 0.28) / 9);
  const carbs = Math.max(70, Math.round((target - protein * 4 - fat * 9) / 4));
  const bmi = weightKg / ((heightCm / 100) ** 2);
  const kgToLose = Math.max(0, weightKg - goalKg);
  const weeks = Math.max(1, Math.ceil(kgToLose / 0.45));
  const water = Math.max(2, Math.round(weightKg * 0.033 * 10) / 10);
  return { bmr: Math.round(bmr), maintenance, target, protein, fat, carbs, weeks, bmi: bmi.toFixed(1), water, weightKg, goalKg };
}

function validate(form) {
  const m = measurements(form);
  if (Number(form.age) < 18 || Number(form.age) > 80) return 'Age must be between 18 and 80.';
  if (m.heightCm < 130 || m.heightCm > 230) return 'Please enter a valid height.';
  if (m.weightKg < 40 || m.weightKg > 300) return 'Please enter a valid weight.';
  if (m.goalKg >= m.weightKg) return 'Goal weight must be lower than current weight for a weight-loss plan.';
  return '';
}

export default function Home() {
  const [form, setForm] = useState(initial);
  const [screen, setScreen] = useState('home');
  const [quizStep, setQuizStep] = useState(1);
  const [error, setError] = useState('');
  const plan = useMemo(() => estimatePlan(form), [form]);
  const meals = mealLibraries[form.preference] || mealLibraries['no-preference'];
  const update = (key, value) => setForm(v => ({ ...v, [key]: value }));

  function continueQuiz() {
    if (quizStep === 1) {
      const message = validate(form);
      if (message) return setError(message);
    }
    setError('');
    if (quizStep < 3) setQuizStep(s => s + 1);
    else setScreen('paywall');
  }

  function openQuiz() {
    setQuizStep(1);
    setError('');
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main>
      <nav className="nav shell">
        <button className="brand" onClick={() => setScreen('home')}><span className="mark">L</span><span>Leanivio</span></button>
        <div className="navlinks"><a href="#how">How it works</a><a href="#features">What you get</a><a href="#faq">FAQ</a></div>
        <button className="smallCta" onClick={openQuiz}>Build my plan</button>
      </nav>

      {screen === 'home' && <>
        <section className="hero shell">
          <div className="heroCopy">
            <div className="eyebrow">PERSONALIZED NUTRITION, MADE SIMPLE</div>
            <h1>Stop guessing.<br/><span>Eat for your goal.</span></h1>
            <p>Get a practical weight-loss meal plan built around your body, activity, food preferences, allergies, cooking time, and weekly budget.</p>
            <button className="primary" onClick={openQuiz}>Create my personalized plan <span>→</span></button>
            <div className="trust"><span>✓ One-time payment</span><span>✓ Instant access</span><span>✓ No subscription required</span></div>
          </div>
          <div className="dashboardCard">
            <div className="cardTop"><span>Your daily target</span><span className="pill">Personalized</span></div>
            <div className="calories"><strong>1,850</strong><small>calories/day</small></div>
            <div className="macroGrid"><div><b>145g</b><span>Protein</span></div><div><b>185g</b><span>Carbs</span></div><div><b>58g</b><span>Fat</span></div></div>
            <div className="mealPreview"><div className="foodIcon">🥗</div><div><b>Chicken power bowl</b><span>High protein · 520 cal</span></div><strong>Lunch</strong></div>
            <div className="mealPreview"><div className="foodIcon">🍳</div><div><b>Protein breakfast wrap</b><span>Balanced · 410 cal</span></div><strong>Breakfast</strong></div>
            <div className="progress"><span>Daily plan</span><b>3 meals + 1 snack</b><i><em></em></i></div>
          </div>
        </section>

        <section className="logos"><span>Built for real life</span><b>Flexible meals</b><b>Smart portions</b><b>Budget friendly</b><b>Food swaps</b></section>

        <section id="how" className="section shell">
          <div className="sectionHead"><span>HOW IT WORKS</span><h2>Your plan in three simple steps</h2><p>Answer a few questions, review your calculated targets, and unlock a clear 30-day plan you can follow.</p></div>
          <div className="steps"><article><i>1</i><h3>Tell us about you</h3><p>Enter your body measurements, activity, food preferences, allergies, and budget.</p></article><article><i>2</i><h3>We calculate your targets</h3><p>Your calories, protein, carbohydrates, fat, water, and timeline are estimated from your information.</p></article><article><i>3</i><h3>Unlock your plan</h3><p>Pay once to access your meal schedule, grocery list, food swaps, and printable guide.</p></article></div>
        </section>

        <section id="features" className="blueSection"><div className="shell featureWrap"><div><span className="lightLabel">MORE THAN A MEAL LIST</span><h2>A plan designed around your life</h2><p>Leanivio adapts to what you eat, what you avoid, how much time you have, and what you can spend.</p><ul><li>Personal calorie and macro targets</li><li>30-day meal schedule with portion guidance</li><li>Halal, vegetarian, vegan, keto, and Mediterranean options</li><li>Weekly grocery lists organized by aisle</li><li>Food swaps for dislikes and allergies</li><li>Budget and quick-cooking modes</li></ul></div><div className="phone"><div className="phoneTop">Today <span>•••</span></div><h4>Good morning, Alex</h4><p>Here is your plan for today.</p>{['Breakfast · Protein oats','Lunch · Chicken rice bowl','Snack · Yogurt & berries','Dinner · Salmon & potatoes'].map((x,i)=><div className="phoneMeal" key={x}><span>{['🥣','🥙','🫐','🐟'][i]}</span><b>{x}</b><i>{[390,540,220,610][i]} cal</i></div>)}</div></div></section>

        <section id="faq" className="section shell faq"><div className="sectionHead"><span>FAQ</span><h2>Questions before you start</h2></div><details><summary>Is this medical advice?</summary><p>No. Leanivio provides general educational nutrition guidance and is not a substitute for a physician or registered dietitian.</p></details><details><summary>Can I list allergies and foods I dislike?</summary><p>Yes. Your answers are used to filter foods and suggest alternatives.</p></details><details><summary>Does it support pounds and feet?</summary><p>Yes. Users can switch between U.S. and metric measurements.</p></details><details><summary>Do I have to subscribe?</summary><p>No. The launch offer is a one-time payment for one personalized 30-day plan.</p></details></section>
      </>}

      {screen === 'quiz' && <section className="quizPage shell">
        <button className="back" onClick={() => quizStep > 1 ? setQuizStep(s => s - 1) : setScreen('home')}>← Back</button>
        <div className="quizProgress"><span style={{width: `${quizStep / 3 * 100}%`}}></span></div>
        <div className="quizGrid">
          <div className="quizCard">
            <div className="eyebrow">STEP {quizStep} OF 3</div>
            {quizStep === 1 && <>
              <h2>Your body and goal</h2><p>These details are used to estimate your daily energy needs.</p>
              <div className="unitToggle"><button className={form.unit === 'us' ? 'active' : ''} onClick={()=>update('unit','us')}>U.S. units</button><button className={form.unit === 'metric' ? 'active' : ''} onClick={()=>update('unit','metric')}>Metric</button></div>
              <div className="two"><label>Sex<select value={form.sex} onChange={e=>update('sex',e.target.value)}><option value="male">Male</option><option value="female">Female</option></select></label><label>Age<input type="number" min="18" max="80" value={form.age} onChange={e=>update('age',e.target.value)}/></label></div>
              {form.unit === 'us' ? <><div className="two"><label>Height — feet<input type="number" min="4" max="7" value={form.feet} onChange={e=>update('feet',e.target.value)}/></label><label>Height — inches<input type="number" min="0" max="11" value={form.inches} onChange={e=>update('inches',e.target.value)}/></label></div><div className="two"><label>Current weight (lb)<input type="number" value={form.weightLb} onChange={e=>update('weightLb',e.target.value)}/></label><label>Goal weight (lb)<input type="number" value={form.goalLb} onChange={e=>update('goalLb',e.target.value)}/></label></div></> : <><label>Height (cm)<input type="number" value={form.heightCm} onChange={e=>update('heightCm',e.target.value)}/></label><div className="two"><label>Current weight (kg)<input type="number" value={form.weightKg} onChange={e=>update('weightKg',e.target.value)}/></label><label>Goal weight (kg)<input type="number" value={form.goalKg} onChange={e=>update('goalKg',e.target.value)}/></label></div></>}
            </>}
            {quizStep === 2 && <>
              <h2>Your lifestyle</h2><p>We use this to make the plan realistic for your routine.</p>
              <label>Activity level<select value={form.activity} onChange={e=>update('activity',e.target.value)}>{Object.entries(activityLabels).map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label>
              <div className="two"><label>Meals per day<select value={form.meals} onChange={e=>update('meals',e.target.value)}><option>2</option><option>3</option><option>4</option><option>5</option></select></label><label>Cooking time<select value={form.cookingTime} onChange={e=>update('cookingTime',e.target.value)}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45+ minutes</option></select></label></div>
              <div className="two"><label>Weekly budget<select value={form.budget} onChange={e=>update('budget',e.target.value)}><option value="budget">Budget-friendly</option><option value="standard">Standard</option><option value="premium">Premium</option></select></label><label>Preferred store<select value={form.store} onChange={e=>update('store',e.target.value)}><option value="any">Any store</option><option>Walmart</option><option>Costco</option><option>Trader Joe's</option><option>Aldi</option></select></label></div>
            </>}
            {quizStep === 3 && <>
              <h2>Your food preferences</h2><p>Your plan should fit your diet, not fight it.</p>
              <label>Food preference<select value={form.preference} onChange={e=>update('preference',e.target.value)}><option value="no-preference">No preference</option><option value="halal">Halal</option><option value="mediterranean">Mediterranean</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option><option value="keto">Keto</option></select></label>
              <label>Allergies<input placeholder="Example: peanuts, shellfish" value={form.allergies} onChange={e=>update('allergies',e.target.value)}/></label>
              <label>Foods you dislike<input placeholder="Example: broccoli, tuna" value={form.dislikes} onChange={e=>update('dislikes',e.target.value)}/></label>
            </>}
            {error && <div className="formError">{error}</div>}
            <button className="primary full" onClick={continueQuiz}>{quizStep === 3 ? 'Calculate my plan →' : 'Continue →'}</button>
            <small className="legal">By continuing, you confirm you are 18+ and understand this is general educational guidance, not medical advice.</small>
          </div>
          <aside className="liveCard"><span>LIVE ESTIMATE</span><h3>Your projected targets</h3><div className="bigMetric"><b>{plan.target.toLocaleString()}</b><i>calories per day</i></div><div className="results"><div><b>{plan.protein}g</b><span>Protein</span></div><div><b>{plan.carbs}g</b><span>Carbs</span></div><div><b>{plan.fat}g</b><span>Fat</span></div></div><hr/><p>Estimated timeline</p><b>About {plan.weeks} weeks</b><p>Water target</p><b>{plan.water} liters/day</b><p>BMI estimate</p><b>{plan.bmi}</b><div className="notice">Targets are estimates for generally healthy adults. People who are pregnant, under 18, managing a medical condition, or with a history of disordered eating should consult a qualified clinician.</div></aside>
        </div>
      </section>}

      {screen === 'paywall' && <section className="payPage shell">
        <button className="back" onClick={() => setScreen('quiz')}>← Edit answers</button>
        <div className="payGrid"><div><span className="successBadge">✓ Your plan is ready</span><h1>Your personalized targets are calculated.</h1><p>Unlock your complete 30-day meal plan based on your body, activity, preferences, allergies, budget, and cooking time.</p><div className="lockedPreview"><div className="blurred"><div className="previewTargets"><b>{plan.target} cal</b><b>{plan.protein}g protein</b><b>{plan.water}L water</b></div>{meals.map(m=><div className="lockedMeal" key={m[0]}><b>{m[0]}</b><span>{m[1]}</span><i>{m[2]} cal</i></div>)}</div><div className="lock"><span>🔒</span><b>Your 30-day plan is locked</b><small>Complete payment to view meals, portions, swaps, and grocery lists.</small></div></div></div>
          <aside className="checkout"><span className="eyebrow">ONE-TIME PURCHASE</span><h2>Complete personalized plan</h2><div className="price"><b>$9.99</b><span>one time</span></div><ul><li>30-day personalized meal schedule</li><li>Exact calorie and macro targets</li><li>Four weekly grocery lists</li><li>Foods to choose and limit</li><li>Allergy-aware food swaps</li><li>Quick and budget meal options</li><li>Printable PDF guide</li></ul><button className="primary full" onClick={() => alert('Next step: connect this button to a Stripe Payment Link or Stripe Checkout session.')}>Pay securely with Stripe →</button><div className="secure">🔒 Secure checkout · Instant access</div><small>Stripe is not live yet. The button is ready to be connected after you create your Stripe business account.</small></aside></div>
      </section>}

      <footer><div className="shell"><div className="brand"><span className="mark">L</span><span>Leanivio</span></div><p>Personalized nutrition for real life.</p><div><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Disclaimer</a></div><small>© 2026 Leanivio. General educational information only.</small></div></footer>
    </main>
  );
}
