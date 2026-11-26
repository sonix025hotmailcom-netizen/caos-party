/* ================== CAOS PARTY v10 — PERSONAJES 3D, CHEF LOCO 3D, PAINTBALL 3D ================== */
const CHARS = [['Robot', 'Robot'], ['Rabbit_Pink', 'Coneja Rosa'], ['Rabbit_Cyan', 'Conejo Celeste'], ['Rabbit_Green', 'Coneja Verde'], ['Rabbit_Purple', 'Conejo Morado'], ['Rabbit_Blond', 'Coneja Rubia'], ['Rabbit_Grey', 'Conejo Gris'], ['Rabbit_Bald', 'Conejo Pelón'], ['Panda', 'Panda Ninja']];
const CHAR_BY_COLOR = { '#ff4d6d': 'Rabbit_Pink', '#3b82f6': 'Rabbit_Cyan', '#22c55e': 'Rabbit_Green', '#f59e0b': 'Rabbit_Blond', '#a855f7': 'Rabbit_Purple', '#f97316': 'Panda', '#14b8a6': 'Rabbit_Grey', '#ec4899': 'Rabbit_Bald' };
const charOf = p => (p && CHARS.some(c => c[0] === p.char)) ? p.char : 'Robot';
const charURL = k => k === 'Robot' ? 'assets/robot.glb' : `assets/chars/${k}.glb`;
const ANIM_ALIAS = { Dance: 'Wave', ThumbsUp: 'Yes', Sitting: 'Sitting_Idle', Running: 'Run', Walking: 'Walk', Run_Gun: 'Run', Idle_Shoot: 'Idle', Run: 'Running', Walk: 'Walking', HitReact: 'No', Chop_Loop: 'Punch' };
const CHAR_DONE = {};
