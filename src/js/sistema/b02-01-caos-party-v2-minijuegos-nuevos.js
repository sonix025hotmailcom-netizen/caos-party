/* ================== CAOS PARTY v2 — MINIJUEGOS NUEVOS ================== */
const A = o => { try { if (window.anime) return anime(o); } catch (e) {} return null; };
const STARS = Array.from({ length: 90 }, () => ({ x: Math.random() * 1000, y: Math.random() * 600, a: .2 + Math.random() * .6 }));
const SIMON = [{ c: '#22c55e', s: '▲', f: 392 }, { c: '#ef4444', s: '●', f: 523 }, { c: '#facc15', s: '■', f: 659 }, { c: '#3b82f6', s: '★', f: 784 }];
const LIKELY = [
 'se quede dormido en clase','se ría en el peor momento posible','se haga famoso en TikTok','se pierda aun con el GPS puesto',
 'llegue tarde a su propia boda','se coma la comida de otro de la refri','sobreviva a un apocalipsis zombie','mande audios de 5 minutos',
 'le hable a su mascota como a un bebé','se haga millonario','termine viviendo en la playa','se olvide del cumpleaños de alguien',
 'gane un concurso de baile','llore viendo una película animada','diga "ya voy" y salga una hora después','se caiga en público',
 'adopte 10 gatos','pase toda la noche jugando','ande con el celular en 1%','se ponga a cantar en el bus','se vuelva youtuber',
 'se coma algo que se cayó al piso','se duerma en una fiesta','compre algo que no necesita a las 3 a.m.',
];
const CEMO = ['🐸','🍕','👻','🦄','🌮','🐙','🍌','⭐','🐔','🍩','🦖','🎈'];
