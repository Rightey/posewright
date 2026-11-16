import { i as __toESM } from "../_runtime.mjs";
import { G as require_jsx_runtime, K as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Uint16BufferAttribute, C as Raycaster, D as Skeleton, E as ShaderMaterial, M as Vector3, N as WebGLRenderTarget, O as SkinnedMesh, S as Quaternion, T as Scene, _ as MeshBasicMaterial, a as BufferAttribute, b as Object3D, c as Color, d as Float32BufferAttribute, f as GridHelper, g as Mesh, h as LinearSRGBColorSpace, i as Bone, j as Vector2, k as SphereGeometry, l as DirectionalLight, m as HemisphereLight, n as OrbitControls, o as BufferGeometry, p as Group, r as WebGLRenderer, s as CircleGeometry, t as TransformControls, u as Euler, v as MeshNormalMaterial, w as SRGBColorSpace, x as PerspectiveCamera, y as MeshStandardMaterial } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PoserApp-CmdqY67x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function headAnchors(headLen) {
	const s = headLen;
	return {
		nose: {
			x: 0,
			y: s * .4,
			z: s * .48
		},
		left_eye: {
			x: s * .16,
			y: s * .58,
			z: s * .38
		},
		right_eye: {
			x: -s * .16,
			y: s * .58,
			z: s * .38
		},
		left_ear: {
			x: s * .4,
			y: s * .52,
			z: 0
		},
		right_ear: {
			x: -s * .4,
			y: s * .52,
			z: 0
		}
	};
}
function p(headLen, x, y, z) {
	return {
		x: x * headLen,
		y: y * headLen,
		z: z * headLen
	};
}
function faceLandmarks(headLen) {
	const pts = [];
	for (let i = 0; i <= 16; i++) {
		const t = i / 16;
		const x = -.38 + .76 * t;
		const y = .55 - Math.sin(Math.PI * t) * .4;
		const z = .06 + Math.sin(Math.PI * t) * .28;
		pts.push(p(headLen, x, y, z));
	}
	const brow = (x0, x1, arch) => {
		for (let i = 0; i < 5; i++) {
			const t = i / 4;
			const x = x0 + (x1 - x0) * t;
			const y = .7 + Math.sin(Math.PI * t) * .035 * arch;
			pts.push(p(headLen, x, y, .36));
		}
	};
	brow(-.3, -.08, 1);
	brow(.08, .3, 1);
	for (let i = 0; i < 4; i++) {
		const t = i / 3;
		pts.push(p(headLen, 0, .66 - t * .22, .34 + t * .14));
	}
	const noseX = [
		-.12,
		-.06,
		0,
		.06,
		.12
	];
	const noseZ = [
		.4,
		.44,
		.48,
		.44,
		.4
	];
	for (let i = 0; i < 5; i++) pts.push(p(headLen, noseX[i], .38, noseZ[i]));
	const eye = (sign) => {
		const cx = sign * .16;
		const cy = .58;
		const rx = .07;
		const ry = .03;
		const ang = [
			Math.PI,
			Math.PI * 1.35,
			Math.PI * 1.7,
			0,
			Math.PI * .35,
			Math.PI * .7
		];
		for (const a of ang) {
			const x = cx + Math.cos(a) * rx * sign * -1;
			const y = cy + Math.sin(a) * ry;
			pts.push(p(headLen, x, y, .38));
		}
	};
	eye(-1);
	eye(1);
	const mouth = (n, rx, ry, y, z) => {
		for (let i = 0; i < n; i++) {
			Math.PI + i / n * Math.PI * 2;
			const upper = i < n / 2;
			const t = upper ? i / (n / 2) : (i - n / 2) / (n / 2);
			const x = -rx + t * 2 * rx;
			const yy = y + (upper ? Math.sin(Math.PI * t) * ry : -Math.sin(Math.PI * t) * ry * 1.15);
			pts.push(p(headLen, x, yy, z));
		}
	};
	mouth(12, .13, .035, .28, .4);
	mouth(8, .08, .02, .275, .39);
	if (pts.length !== 68) throw new Error(`face landmarks must be 68, got ${pts.length}`);
	return pts;
}
var AGE = [
	5,
	10,
	15,
	22,
	40,
	60,
	80
];
function sample(age, values) {
	if (age <= AGE[0]) return values[0];
	const last = AGE.length - 1;
	if (age >= AGE[last]) return values[last];
	for (let i = 0; i < last; i++) if (age <= AGE[i + 1]) {
		const t = (age - AGE[i]) / (AGE[i + 1] - AGE[i]);
		return values[i] * (1 - t) + values[i + 1] * t;
	}
	return values[last];
}
function lerp(a, b, t) {
	return a + (b - a) * t;
}
function clamp$1(v, a, b) {
	return Math.min(b, Math.max(a, v));
}
function heightLimits(age) {
	return {
		min: sample(age, [
			95,
			120,
			145,
			148,
			148,
			145,
			140
		]),
		max: sample(age, [
			125,
			160,
			190,
			205,
			205,
			198,
			190
		]),
		typical: sample(age, [
			110,
			140,
			168,
			172,
			170,
			166,
			160
		])
	};
}
function clampParams(p) {
	const lim = heightLimits(p.age);
	return {
		sex: clamp$1(p.sex, 0, 1),
		age: clamp$1(p.age, 5, 80),
		heightCm: clamp$1(p.heightCm, lim.min, lim.max),
		mass: clamp$1(p.mass, 0, 1),
		muscle: clamp$1(p.muscle, 0, 1),
		shoulder: clamp$1(p.shoulder, .75, 1.35),
		hip: clamp$1(p.hip, .75, 1.35),
		torso: clamp$1(p.torso, .82, 1.2),
		leg: clamp$1(p.leg, .82, 1.2)
	};
}
function add(segments, name, parent, head, tail, rx0, rx1, rz0, rz1, kind, radial = 8, rings = 4) {
	segments.push({
		name,
		parent,
		head,
		tail,
		rx0,
		rx1,
		rz0,
		rz1,
		kind,
		radial,
		rings
	});
}
function norm(v) {
	const l = Math.hypot(v.x, v.y, v.z) || 1;
	return {
		x: v.x / l,
		y: v.y / l,
		z: v.z / l
	};
}
function mad(a, b, s) {
	return {
		x: a.x + b.x * s,
		y: a.y + b.y * s,
		z: a.z + b.z * s
	};
}
/** Head length in meters for the current params (after height normalization). */
function layoutFigure(raw) {
	const p = clampParams(raw);
	const H = p.heightCm / 100;
	const sex = p.sex;
	const age = p.age;
	const headF = sample(age, [
		.182,
		.158,
		.142,
		.133,
		.13,
		.134,
		.142
	]);
	const neckF = sample(age, [
		.03,
		.033,
		.037,
		.042,
		.042,
		.04,
		.038
	]);
	const footF = sample(age, [
		.038,
		.04,
		.042,
		.043,
		.043,
		.044,
		.045
	]);
	const hipF = sample(age, [
		.46,
		.5,
		.525,
		.532,
		.53,
		.52,
		.505
	]);
	const shankShare = sample(age, [
		.46,
		.48,
		.5,
		.505,
		.5,
		.495,
		.49
	]);
	let foot = footF;
	let leg = Math.max(.28, hipF - footF) * p.leg;
	let thigh = leg * (1 - shankShare);
	let shank = leg * shankShare;
	let neck = neckF;
	let head = headF;
	let torso = Math.max(.2, 1 - (foot + thigh + shank + neck + head));
	torso *= p.torso;
	const k = 1 / (foot + thigh + shank + torso + neck + head);
	foot *= k * H;
	thigh *= k * H;
	shank *= k * H;
	torso *= k * H;
	neck *= k * H;
	head *= k * H;
	const yAnkle = foot * .92;
	const yKnee = yAnkle + shank;
	const yHip = yKnee + thigh;
	const spineLen = torso * .56;
	const yChest = yHip + spineLen;
	const yShoulder = yHip + torso;
	const yNeck = yShoulder + neck;
	const yCrown = yNeck + head;
	const shoulderW = H * lerp(.218, .258, sex) * sample(age, [
		.9,
		.95,
		1,
		1,
		1,
		.98,
		.95
	]) * p.shoulder;
	const hipW = H * lerp(.195, .162, sex) * sample(age, [
		1.06,
		1,
		.98,
		1,
		1,
		1.03,
		1.06
	]) * p.hip;
	const mass = p.mass;
	const muscle = p.muscle;
	const slim = .78 + mass * .85;
	const msc = .82 + muscle * .6;
	const thighR = H * .055 * slim * (.88 + muscle * .28);
	const kneeR = H * .038 * (.9 + mass * .25) * (.9 + muscle * .2);
	const ankleR = H * .026 * (.9 + mass * .15);
	const armR = H * .03 * msc * (.88 + mass * .22);
	const elbowR = H * .024 * msc;
	const wristR = H * .018 * (.9 + muscle * .15);
	const neckR = H * .028 * (.88 + mass * .4);
	const waistRx = hipW * .46 * (.7 + mass * .75);
	const waistRz = H * .058 * (.68 + mass * 1.05);
	const chestRx = H * lerp(.085, .1, sex) * (.82 + mass * .45) * (1 + muscle * .08);
	const chestRz = H * lerp(.07, .078, sex) * (.8 + mass * .6);
	const pelvisRx = hipW * .62;
	const pelvisRz = H * .07 * (.85 + mass * .45);
	const upperArm = H * sample(age, [
		.16,
		.17,
		.18,
		.186,
		.186,
		.182,
		.176
	]) * lerp(.98, 1.02, sex);
	const forearm = H * sample(age, [
		.128,
		.136,
		.142,
		.146,
		.146,
		.142,
		.138
	]) * lerp(.97, 1.02, sex);
	const handLen = H * sample(age, [
		.09,
		.098,
		.104,
		.108,
		.108,
		.105,
		.1
	]);
	const segments = [];
	const hip = {
		x: 0,
		y: yHip,
		z: 0
	};
	add(segments, "hips", null, hip, {
		x: 0,
		y: yHip + spineLen * .15,
		z: 0
	}, pelvisRx, pelvisRx, pelvisRz, pelvisRz, "ellipsoid", 10, 8);
	add(segments, "spine", "hips", hip, {
		x: 0,
		y: yChest,
		z: 0
	}, pelvisRx * .72, waistRx, pelvisRz * .85, waistRz, "tube", 10, 5);
	add(segments, "chest", "spine", {
		x: 0,
		y: yChest,
		z: 0
	}, {
		x: 0,
		y: yShoulder,
		z: 0
	}, waistRx * .98, chestRx, waistRz * .95, chestRz, "tube", 10, 5);
	add(segments, "neck", "chest", {
		x: 0,
		y: yShoulder,
		z: 0
	}, {
		x: 0,
		y: yNeck,
		z: 0
	}, neckR * 1.15, neckR, neckR * 1.15, neckR, "tube", 8, 3);
	const headRx = head * .4;
	const headRy = head * .5;
	const headRz = head * .46;
	add(segments, "head", "neck", {
		x: 0,
		y: yNeck,
		z: 0
	}, {
		x: 0,
		y: yCrown,
		z: 0
	}, headRx, headRy, headRz, headRz, "ellipsoid", 16, 12);
	const hipSpread = hipW * .38;
	const shSpread = shoulderW * .5;
	const arm = (side, sign) => {
		const shoulder = {
			x: sign * shSpread,
			y: yShoulder,
			z: 0
		};
		const elbow = {
			x: shoulder.x + sign * upperArm,
			y: yShoulder,
			z: 0
		};
		const wrist = {
			x: elbow.x + sign * forearm,
			y: yShoulder,
			z: 0
		};
		const palm = handLen * .5;
		const handEnd = {
			x: wrist.x + sign * palm,
			y: yShoulder,
			z: 0
		};
		add(segments, `upperArm.${side}`, "chest", shoulder, elbow, armR, elbowR * 1.05, armR, elbowR, "tube", 8, 4);
		add(segments, `lowerArm.${side}`, `upperArm.${side}`, elbow, wrist, elbowR, wristR * 1.15, elbowR * .95, wristR, "tube", 8, 4);
		add(segments, `hand.${side}`, `lowerArm.${side}`, wrist, handEnd, handLen * .16, handLen * .13, handLen * .05, handLen * .035, "box", 4, 2);
		addFingers(segments, side, sign, wrist, handLen);
	};
	arm("L", 1);
	arm("R", -1);
	const addLeg = (side, sign) => {
		const hj = {
			x: sign * hipSpread,
			y: yHip,
			z: 0
		};
		const kj = {
			x: sign * hipSpread,
			y: yKnee,
			z: 0
		};
		const aj = {
			x: sign * hipSpread,
			y: yAnkle,
			z: 0
		};
		const toe = {
			x: aj.x,
			y: yAnkle * .45,
			z: H * .11
		};
		add(segments, `upperLeg.${side}`, "hips", hj, kj, thighR, kneeR * 1.15, thighR * .95, kneeR, "tube", 8, 5);
		add(segments, `lowerLeg.${side}`, `upperLeg.${side}`, kj, aj, kneeR, ankleR * 1.2, kneeR * .95, ankleR, "tube", 8, 4);
		add(segments, `foot.${side}`, `lowerLeg.${side}`, aj, toe, H * .028, H * .02, H * .02, H * .014, "box", 4, 2);
	};
	addLeg("L", 1);
	addLeg("R", -1);
	return segments;
}
function addFingers(segments, side, sign, wrist, handLen) {
	const palm = handLen * .5;
	for (const f of [
		{
			n: "index",
			z: .2,
			y: .02,
			len: .48,
			dirZ: .08
		},
		{
			n: "middle",
			z: .02,
			y: .01,
			len: .54,
			dirZ: 0
		},
		{
			n: "ring",
			z: -.14,
			y: 0,
			len: .5,
			dirZ: -.05
		},
		{
			n: "pinky",
			z: -.28,
			y: -.01,
			len: .38,
			dirZ: -.1
		}
	]) {
		const origin = {
			x: wrist.x + sign * palm,
			y: wrist.y + handLen * f.y,
			z: wrist.z + handLen * f.z
		};
		const dir = norm({
			x: sign,
			y: 0,
			z: f.dirZ
		});
		const total = handLen * f.len;
		const lens = [
			total * .42,
			total * .32,
			total * .26
		];
		let parent = `hand.${side}`;
		let head = origin;
		for (let i = 0; i < 3; i++) {
			const name = `${f.n}${i + 1}.${side}`;
			const r0 = handLen * (.045 - i * .008);
			const r1 = r0 * .78;
			const tail = mad(head, dir, lens[i]);
			add(segments, name, parent, head, tail, r0, r1, r0 * .85, r1 * .85, "tube", 5, 2);
			parent = name;
			head = tail;
		}
	}
	const thumbHead = {
		x: wrist.x + sign * palm * .28,
		y: wrist.y - handLen * .02,
		z: wrist.z + handLen * .1
	};
	const thumbDir = norm({
		x: sign * .25,
		y: -.2,
		z: .9
	});
	const thumbTotal = handLen * .42;
	const tlens = [
		thumbTotal * .38,
		thumbTotal * .32,
		thumbTotal * .3
	];
	let parent = `hand.${side}`;
	let head = thumbHead;
	for (let i = 0; i < 3; i++) {
		const name = `thumb${i + 1}.${side}`;
		const r0 = handLen * (.05 - i * .008);
		const tail = mad(head, thumbDir, tlens[i]);
		add(segments, name, parent, head, tail, r0, r0 * .8, r0 * .8, r0 * .65, "tube", 5, 2);
		parent = name;
		head = tail;
	}
}
function segmentMap(segments) {
	return new Map(segments.map((s) => [s.name, s]));
}
function restDirection(seg) {
	return norm({
		x: seg.tail.x - seg.head.x,
		y: seg.tail.y - seg.head.y,
		z: seg.tail.z - seg.head.z
	});
}
function headLength(segments) {
	const h = segments.find((s) => s.name === "head");
	if (!h) return .2;
	return Math.hypot(h.tail.x - h.head.x, h.tail.y - h.head.y, h.tail.z - h.head.z);
}
var _from = new Vector3();
var _to = new Vector3();
var _inv = new Quaternion();
var _align = new Quaternion();
var _swing = new Quaternion();
var _twist = new Quaternion();
/**
* Two-bone IK (law of cosines) with a pole vector.
* The bend is pushed toward `pole`. The target is clamped to the reachable range
* so the bones keep their rest lengths.
*/
function solveElbow(root, target, len1, len2, pole, out) {
	const axis = new Vector3().subVectors(target, root);
	let dist = axis.length();
	Math.max(len1, len2, len1 + len2 - 1e-4);
	const min = Math.abs(len1 - len2) + 1e-4;
	const reach = Math.min(Math.max(dist, min), len1 + len2 - 1e-4);
	if (dist < 1e-8) axis.set(0, 1, 0);
	else axis.multiplyScalar(1 / dist);
	dist = reach;
	const cosA = (len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist);
	const along = Math.min(1, Math.max(-1, cosA)) * len1;
	const height = Math.sqrt(Math.max(0, len1 * len1 - along * along));
	out.copy(root).addScaledVector(axis, along);
	const side = new Vector3().subVectors(pole, root);
	side.addScaledVector(axis, -side.dot(axis));
	if (side.lengthSq() < 1e-8) {
		side.set(0, 0, 1).addScaledVector(axis, -axis.z);
		if (side.lengthSq() < 1e-8) side.set(0, 1, 0).addScaledVector(axis, -axis.y);
	}
	side.normalize();
	out.addScaledVector(side, height);
	return out;
}
function boneLength(seg) {
	return Math.hypot(seg.tail.x - seg.head.x, seg.tail.y - seg.head.y, seg.tail.z - seg.head.z);
}
/**
* Aim `bone` so its rest axis points along `worldDir`, keeping the twist it
* already had. Preserving twist means enabling IK on an unchanged pose does
* not spin the chest or the palms.
*/
function aim(bone, restDir, worldDir) {
	const parent = bone.parent;
	_inv.identity();
	if (parent) parent.getWorldQuaternion(_inv).invert();
	_to.copy(worldDir).normalize().applyQuaternion(_inv);
	_from.copy(restDir).normalize();
	if (_to.lengthSq() < 1e-10 || _from.lengthSq() < 1e-10) return;
	if (_from.dot(_to) < -.999) {
		const axis = Math.abs(_from.y) < .9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
		axis.cross(_from).normalize();
		_align.setFromAxisAngle(axis, Math.PI);
	} else _align.setFromUnitVectors(_from, _to);
	const currentDir = _from.clone().applyQuaternion(bone.quaternion);
	if (currentDir.lengthSq() < 1e-10) {
		bone.quaternion.copy(_align);
		return;
	}
	currentDir.normalize();
	if (_from.dot(currentDir) < -.999) {
		bone.quaternion.copy(_align);
		return;
	}
	_swing.setFromUnitVectors(_from, currentDir);
	_twist.copy(_swing).invert().multiply(bone.quaternion);
	bone.quaternion.copy(_align).multiply(_twist);
}
function aimTwo(upper, lower, upperRest, lowerRest, root, mid, end) {
	aim(upper, upperRest, new Vector3().subVectors(mid, root));
	upper.updateWorldMatrix(true, false);
	aim(lower, lowerRest, new Vector3().subVectors(end, mid));
	lower.updateWorldMatrix(true, false);
}
function asVec(v) {
	return new Vector3(v.x, v.y, v.z);
}
function restVec(seg) {
	const d = restDirection(seg);
	return new Vector3(d.x, d.y, d.z);
}
/**
* FABRIK. `lengths[i]` joins point i to i+1. Point 0 is pinned.
* Used for the spine / neck chain (more than two bones).
*/
function fabrik(points, lengths, target, iterations = 8) {
	const p = points.map((v) => v.clone());
	const origin = p[0].clone();
	const n = p.length;
	for (let it = 0; it < iterations; it++) {
		p[n - 1].copy(target);
		for (let i = n - 2; i >= 0; i--) {
			const dir = p[i].clone().sub(p[i + 1]);
			const d = dir.length() || 1e-6;
			dir.multiplyScalar(lengths[i] / d);
			p[i].copy(p[i + 1]).add(dir);
		}
		p[0].copy(origin);
		for (let i = 0; i < n - 1; i++) {
			const dir = p[i + 1].clone().sub(p[i]);
			const d = dir.length() || 1e-6;
			dir.multiplyScalar(lengths[i] / d);
			p[i + 1].copy(p[i]).add(dir);
		}
	}
	return p;
}
/**
* Targets are in the skinned mesh's local space (figure space).
* Elbows bend toward figure −Z (behind), knees toward +Z (forward).
*/
function solveIk(bones, segments, targets, mesh) {
	mesh.updateWorldMatrix(true, true);
	solveSpine(bones, segments, targets.head, mesh);
	mesh.updateWorldMatrix(true, true);
	solveLimb(bones, segments, "upperArm.L", "lowerArm.L", targets.handL, new Vector3(0, -.25, -1), mesh);
	solveLimb(bones, segments, "upperArm.R", "lowerArm.R", targets.handR, new Vector3(0, -.25, -1), mesh);
	solveLimb(bones, segments, "upperLeg.L", "lowerLeg.L", targets.footL, new Vector3(0, -.15, 1), mesh);
	solveLimb(bones, segments, "upperLeg.R", "lowerLeg.R", targets.footR, new Vector3(0, -.15, 1), mesh);
	mesh.updateWorldMatrix(true, true);
}
function solveLimb(bones, segments, upperName, lowerName, targetLocal, poleOffset, mesh) {
	const upper = bones.get(upperName);
	const lower = bones.get(lowerName);
	const su = segments.get(upperName);
	const sl = segments.get(lowerName);
	if (!upper || !lower || !su || !sl) return;
	upper.updateWorldMatrix(true, false);
	const rootPos = new Vector3();
	upper.getWorldPosition(rootPos);
	const localRoot = mesh.worldToLocal(rootPos.clone());
	const pole = mesh.localToWorld(localRoot.add(poleOffset));
	const target = mesh.localToWorld(asVec(targetLocal));
	const len1 = Math.max(1e-4, boneLength(su));
	const len2 = Math.max(1e-4, boneLength(sl));
	const axis = new Vector3().subVectors(target, rootPos);
	let dist = axis.length() || 1e-6;
	const reach = Math.min(Math.max(dist, Math.abs(len1 - len2) + 1e-4), len1 + len2 - 1e-4);
	const clamped = rootPos.clone().add(axis.multiplyScalar(reach / dist));
	const mid = solveElbow(rootPos, clamped, len1, len2, pole, new Vector3());
	aimTwo(upper, lower, restVec(su), restVec(sl), rootPos, mid, clamped);
}
function solveSpine(bones, segments, headTarget, mesh) {
	const names = [
		"spine",
		"chest",
		"neck",
		"head"
	];
	const joints = [];
	const segs = [];
	for (const n of names) {
		const b = bones.get(n);
		const s = segments.get(n);
		if (!b || !s) return;
		joints.push(b);
		segs.push(s);
	}
	const lengths = [
		boneLength(segs[0]),
		boneLength(segs[1]),
		boneLength(segs[2])
	];
	joints[0].updateWorldMatrix(true, false);
	const points = [new Vector3()];
	joints[0].getWorldPosition(points[0]);
	for (let i = 1; i < joints.length; i++) {
		const p = new Vector3();
		joints[i].getWorldPosition(p);
		if (p.distanceTo(points[i - 1]) < 1e-4) p.copy(points[i - 1]).add(new Vector3(0, lengths[i - 1], 0));
		points.push(p);
	}
	const solved = fabrik(points, lengths, mesh.localToWorld(asVec(headTarget)), 8);
	for (let i = 0; i < 3; i++) {
		const dir = new Vector3().subVectors(solved[i + 1], solved[i]);
		aim(joints[i], restVec(segs[i]), dir);
		joints[i].updateWorldMatrix(true, true);
	}
}
/**
* Procedural skinned body. Vertices are in figure space at the T-pose.
* Each vertex is bound to its segment bone, with a blend onto the parent
* near the joint so elbows and knees bend instead of cracking.
* The geometry is non-indexed and carries a barycentric attribute so the
* wireframe export can draw edges in a shader (WebGL line width is unreliable).
*/
var Builder = class {
	pos = [];
	nrm = [];
	skinI = [];
	skinW = [];
	idx = [];
	push(p, n, bone, parent, parentWeight) {
		const i = this.pos.length / 3;
		this.pos.push(p.x, p.y, p.z);
		const nn = n.lengthSq() > 1e-8 ? n.clone().normalize() : new Vector3(0, 1, 0);
		this.nrm.push(nn.x, nn.y, nn.z);
		const pw = parent >= 0 ? parentWeight : 0;
		this.skinI.push(bone, parent >= 0 ? parent : 0, 0, 0);
		this.skinW.push(1 - pw, pw, 0, 0);
		return i;
	}
	tri(a, b, c) {
		this.idx.push(a, b, c);
	}
};
function frame(dir) {
	const y = dir.clone().normalize();
	const x = new Vector3(1, 0, 0).addScaledVector(y, -y.x);
	if (x.lengthSq() < 1e-6) x.set(0, 0, 1).addScaledVector(y, -y.z);
	x.normalize();
	const z = new Vector3().crossVectors(x, y);
	if (z.z < 0) {
		z.negate();
		x.negate();
	}
	z.normalize();
	return {
		x,
		y,
		z
	};
}
function addTube(b, seg, bone, parent) {
	const head = new Vector3(seg.head.x, seg.head.y, seg.head.z);
	const tail = new Vector3(seg.tail.x, seg.tail.y, seg.tail.z);
	const delta = tail.clone().sub(head);
	if (delta.length() < 1e-5) return;
	const { x: sx, y: axis, z: sz } = frame(delta);
	const rings = seg.rings;
	const segs = seg.radial;
	const row = segs + 1;
	const start = b.pos.length / 3;
	for (let r = 0; r <= rings; r++) {
		const t = r / rings;
		const center = head.clone().lerp(tail, t);
		const rx = seg.rx0 + (seg.rx1 - seg.rx0) * t;
		const rz = seg.rz0 + (seg.rz1 - seg.rz0) * t;
		const pw = parent >= 0 && t < .25 ? (1 - t / .25) * .45 : 0;
		for (let s = 0; s <= segs; s++) {
			const a = s / segs * Math.PI * 2;
			const c = Math.cos(a);
			const sn = Math.sin(a);
			const radial = new Vector3().addScaledVector(sx, c).addScaledVector(sz, sn);
			const p = center.clone().addScaledVector(sx, c * Math.max(rx, .002)).addScaledVector(sz, sn * Math.max(rz, .002));
			b.push(p, radial, bone, parent, pw);
		}
	}
	for (let r = 0; r < rings; r++) for (let s = 0; s < segs; s++) {
		const a = start + r * row + s;
		const c = a + row;
		b.tri(a, c, a + 1);
		b.tri(a + 1, c, c + 1);
	}
	const n0 = axis.clone().negate();
	const cap0 = b.push(head, n0, bone, parent, parent >= 0 ? .45 : 0);
	for (let s = 0; s < segs; s++) b.tri(cap0, start + s + 1, start + s);
	const n1 = axis.clone();
	const cap1 = b.push(tail, n1, bone, parent, 0);
	const ring = start + rings * row;
	for (let s = 0; s < segs; s++) b.tri(cap1, ring + s, ring + s + 1);
}
function addEllipsoid(b, center, rx, ry, rz, bone, parent, stacks, slices, nose) {
	const start = b.pos.length / 3;
	for (let iy = 0; iy <= stacks; iy++) {
		const phi = iy / stacks * Math.PI;
		const y = Math.cos(phi);
		const r = Math.sin(phi);
		const pw = parent >= 0 && phi > 2.4 ? (phi - 2.4) / (Math.PI - 2.4) * .4 : 0;
		for (let ix = 0; ix <= slices; ix++) {
			const theta = ix / slices * Math.PI * 2;
			let x = Math.cos(theta) * r;
			let z = Math.sin(theta) * r;
			if (nose) {
				const front = Math.max(0, z);
				const band = Math.exp(-((y - .05) ** 2) / .08) * Math.exp(-(x * x) / .05);
				z += front * band * .22;
			}
			const p = new Vector3(center.x + x * rx, center.y + y * ry, center.z + z * rz);
			const n = new Vector3(x / Math.max(rx, 1e-4), y / Math.max(ry, 1e-4), z / Math.max(rz, 1e-4));
			b.push(p, n, bone, parent, pw);
		}
	}
	const row = slices + 1;
	for (let iy = 0; iy < stacks; iy++) for (let ix = 0; ix < slices; ix++) {
		const a = start + iy * row + ix;
		const c = a + row;
		b.tri(a, c, a + 1);
		b.tri(a + 1, c, c + 1);
	}
}
function buildFigureGeometry(segments, params, boneIndex) {
	const b = new Builder();
	const byName = new Map(segments.map((s) => [s.name, s]));
	for (const seg of segments) {
		const bone = boneIndex.get(seg.name);
		if (bone === void 0) continue;
		const parent = seg.parent ? boneIndex.get(seg.parent) ?? -1 : -1;
		if (seg.kind === "ellipsoid") {
			const center = new Vector3((seg.head.x + seg.tail.x) / 2, (seg.head.y + seg.tail.y) / 2, (seg.head.z + seg.tail.z) / 2);
			const ry = Math.max(.01, Math.abs(seg.tail.y - seg.head.y) / 2);
			addEllipsoid(b, center, seg.rx0, ry, seg.rz0, bone, parent, seg.rings, seg.radial, seg.name === "head");
		} else addTube(b, seg, bone, parent);
	}
	const chest = byName.get("chest");
	const chestBone = boneIndex.get("chest");
	if (chest && chestBone !== void 0 && params.sex < .8 && params.age > 14) {
		const k = (1 - params.sex) * Math.min(1, (params.age - 14) / 8);
		const y = chest.head.y + (chest.tail.y - chest.head.y) * .45;
		const r = chest.rx0 * .42 * (.35 + k);
		const parent = chest.parent ? boneIndex.get(chest.parent) ?? -1 : -1;
		for (const sign of [1, -1]) addEllipsoid(b, new Vector3(sign * chest.rx0 * .55, y, chest.rz0 * .72), r, r * .85, r * .95, chestBone, parent, 6, 8, false);
	}
	const geom = new BufferGeometry();
	geom.setAttribute("position", new Float32BufferAttribute(b.pos, 3));
	geom.setAttribute("normal", new Float32BufferAttribute(b.nrm, 3));
	geom.setAttribute("skinIndex", new Uint16BufferAttribute(b.skinI, 4));
	geom.setAttribute("skinWeight", new Float32BufferAttribute(b.skinW, 4));
	geom.setIndex(b.idx);
	const non = geom.toNonIndexed();
	geom.dispose();
	const count = non.getAttribute("position").count;
	const bary = new Float32Array(count * 3);
	for (let i = 0; i < count; i += 3) {
		bary[i * 3] = 1;
		bary[i * 3 + 4] = 1;
		bary[i * 3 + 8] = 1;
	}
	non.setAttribute("barycentric", new BufferAttribute(bary, 3));
	non.computeBoundingSphere();
	if (non.boundingSphere) non.boundingSphere.radius *= 1.6;
	return non;
}
var ZERO = {
	x: 0,
	y: 0,
	z: 0
};
function v3(x = 0, y = 0, z = 0) {
	return {
		x,
		y,
		z
	};
}
var LIM = {
	spine: {
		x: [-20, 55],
		y: [-40, 40],
		z: [-30, 30]
	},
	chest: {
		x: [-18, 45],
		y: [-35, 35],
		z: [-28, 28]
	},
	neck: {
		x: [-30, 45],
		y: [-70, 70],
		z: [-35, 35]
	},
	head: {
		x: [-35, 45],
		y: [-60, 60],
		z: [-30, 30]
	},
	"upperArm.L": {
		x: [-90, 130],
		y: [-100, 100],
		z: [-170, 170]
	},
	"lowerArm.L": {
		x: [-30, 30],
		y: [-155, 15],
		z: [-25, 25]
	},
	"hand.L": {
		x: [-50, 60],
		y: [-40, 40],
		z: [-70, 70]
	},
	"upperLeg.L": {
		x: [-120, 45],
		y: [-45, 45],
		z: [-50, 70]
	},
	"lowerLeg.L": {
		x: [-8, 155],
		y: [-20, 20],
		z: [-15, 15]
	},
	"foot.L": {
		x: [-40, 50],
		y: [-25, 25],
		z: [-30, 30]
	}
};
var FINGER_LIM_L = {
	x: [-15, 20],
	y: [-20, 20],
	z: [-15, 110]
};
function mirrorLimit(l) {
	return {
		x: l.x,
		y: [-l.y[1], -l.y[0]],
		z: [-l.z[1], -l.z[0]]
	};
}
function limitsFor(name) {
	if (LIM[name]) return LIM[name];
	if (name.endsWith(".R")) {
		const left = limitsFor(name.slice(0, -2) + ".L");
		return left ? mirrorLimit(left) : null;
	}
	if (/\d\.L$/.test(name)) return FINGER_LIM_L;
	if (/\d\.R$/.test(name)) return mirrorLimit(FINGER_LIM_L);
	return null;
}
function clamp(v, range) {
	return Math.min(range[1], Math.max(range[0], v));
}
function clampEuler(name, e) {
	const lim = limitsFor(name);
	if (!lim) return e;
	return {
		x: clamp(e.x, lim.x),
		y: clamp(e.y, lim.y),
		z: clamp(e.z, lim.z)
	};
}
/** Degrees of forward spine pitch blended in for older figures. Not stored in the pose. */
function baseStoop(params) {
	const t = Math.min(1, Math.max(0, (params.age - 55) / 25));
	const stoop = t * t * 16;
	if (stoop < .2) return {};
	return {
		spine: {
			x: stoop * .55,
			y: 0,
			z: 0
		},
		chest: {
			x: stoop * .35,
			y: 0,
			z: 0
		},
		neck: {
			x: -stoop * .12,
			y: 0,
			z: 0
		}
	};
}
function composedEuler(name, pose, params, limits) {
	const u = pose[name] ?? ZERO;
	const b = baseStoop(params)[name] ?? ZERO;
	const e = {
		x: u.x + b.x,
		y: u.y + b.y,
		z: u.z + b.z
	};
	return limits ? clampEuler(name, e) : e;
}
var HAND_CURL = {
	open: {
		thumb: [
			8,
			6,
			4
		],
		index: [
			0,
			0,
			0
		],
		middle: [
			0,
			0,
			0
		],
		ring: [
			0,
			0,
			0
		],
		pinky: [
			0,
			0,
			0
		]
	},
	relaxed: {
		thumb: [
			18,
			14,
			10
		],
		index: [
			18,
			16,
			10
		],
		middle: [
			22,
			18,
			12
		],
		ring: [
			24,
			20,
			12
		],
		pinky: [
			26,
			18,
			10
		]
	},
	fist: {
		thumb: [
			40,
			30,
			25
		],
		index: [
			85,
			95,
			70
		],
		middle: [
			88,
			98,
			72
		],
		ring: [
			88,
			96,
			70
		],
		pinky: [
			82,
			90,
			65
		]
	},
	point: {
		thumb: [
			35,
			25,
			18
		],
		index: [
			4,
			2,
			0
		],
		middle: [
			85,
			95,
			70
		],
		ring: [
			85,
			95,
			70
		],
		pinky: [
			80,
			90,
			65
		]
	},
	grip: {
		thumb: [
			30,
			28,
			20
		],
		index: [
			48,
			55,
			35
		],
		middle: [
			55,
			62,
			40
		],
		ring: [
			55,
			60,
			38
		],
		pinky: [
			50,
			55,
			32
		]
	}
};
var FINGERS = [
	"thumb",
	"index",
	"middle",
	"ring",
	"pinky"
];
function writeHand(pose, side, preset) {
	const sign = side === "L" ? 1 : -1;
	const table = HAND_CURL[preset];
	for (const f of FINGERS) {
		const curls = table[f];
		for (let i = 0; i < 3; i++) pose[`${f}${i + 1}.${side}`] = {
			x: 0,
			y: 0,
			z: sign * curls[i]
		};
	}
	return pose;
}
function mirrorPose(pose, direction) {
	const src = direction === "L2R" ? ".L" : ".R";
	const dst = direction === "L2R" ? ".R" : ".L";
	const next = { ...pose };
	for (const [name, e] of Object.entries(pose)) {
		if (!name.endsWith(src)) continue;
		const other = name.slice(0, -2) + dst;
		next[other] = {
			x: e.x,
			y: -e.y,
			z: -e.z
		};
	}
	return next;
}
function P(partial, hand = "relaxed") {
	const pose = { ...partial };
	writeHand(pose, "L", hand);
	writeHand(pose, "R", hand);
	return pose;
}
var POSE_PRESETS = [
	{
		id: "t",
		name: "T-pose",
		pose: P({}, "open")
	},
	{
		id: "a",
		name: "A-pose",
		pose: P({
			"upperArm.L": {
				x: 0,
				y: 0,
				z: -42
			},
			"upperArm.R": {
				x: 0,
				y: 0,
				z: 42
			},
			"lowerArm.L": {
				x: 0,
				y: -6,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 6,
				z: 0
			}
		})
	},
	{
		id: "stand",
		name: "Standing",
		pose: P({
			"upperArm.L": {
				x: 0,
				y: 8,
				z: -74
			},
			"upperArm.R": {
				x: 0,
				y: -8,
				z: 74
			},
			"lowerArm.L": {
				x: 0,
				y: -14,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 14,
				z: 0
			},
			"hand.L": {
				x: 8,
				y: 0,
				z: 0
			},
			"hand.R": {
				x: 8,
				y: 0,
				z: 0
			}
		})
	},
	{
		id: "walk",
		name: "Walking",
		pose: P({
			"upperLeg.L": {
				x: -28,
				y: 0,
				z: 2
			},
			"upperLeg.R": {
				x: 16,
				y: 0,
				z: -2
			},
			"lowerLeg.L": {
				x: 18,
				y: 0,
				z: 0
			},
			"lowerLeg.R": {
				x: 48,
				y: 0,
				z: 0
			},
			"foot.L": {
				x: -8,
				y: 0,
				z: 0
			},
			"foot.R": {
				x: 6,
				y: 0,
				z: 0
			},
			"upperArm.L": {
				x: 12,
				y: 6,
				z: -68
			},
			"upperArm.R": {
				x: -18,
				y: -6,
				z: 66
			},
			"lowerArm.L": {
				x: 0,
				y: -28,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 18,
				z: 0
			},
			spine: {
				x: 4,
				y: -8,
				z: 2
			}
		})
	},
	{
		id: "run",
		name: "Running",
		pose: P({
			"upperLeg.L": {
				x: -50,
				y: 0,
				z: 4
			},
			"upperLeg.R": {
				x: 22,
				y: 0,
				z: -4
			},
			"lowerLeg.L": {
				x: 70,
				y: 0,
				z: 0
			},
			"lowerLeg.R": {
				x: 18,
				y: 0,
				z: 0
			},
			"upperArm.L": {
				x: 30,
				y: 10,
				z: -50
			},
			"upperArm.R": {
				x: -40,
				y: -10,
				z: 48
			},
			"lowerArm.L": {
				x: 0,
				y: -70,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 55,
				z: 0
			},
			spine: {
				x: 14,
				y: -10,
				z: 0
			},
			chest: {
				x: 8,
				y: 0,
				z: 0
			}
		})
	},
	{
		id: "sit",
		name: "Sitting",
		pose: P({
			"upperLeg.L": {
				x: -88,
				y: 6,
				z: 4
			},
			"upperLeg.R": {
				x: -88,
				y: -6,
				z: -4
			},
			"lowerLeg.L": {
				x: 90,
				y: 0,
				z: 0
			},
			"lowerLeg.R": {
				x: 90,
				y: 0,
				z: 0
			},
			"foot.L": {
				x: 8,
				y: 0,
				z: 0
			},
			"foot.R": {
				x: 8,
				y: 0,
				z: 0
			},
			"upperArm.L": {
				x: 10,
				y: 20,
				z: -58
			},
			"upperArm.R": {
				x: 10,
				y: -20,
				z: 58
			},
			"lowerArm.L": {
				x: 0,
				y: -50,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 50,
				z: 0
			},
			spine: {
				x: 8,
				y: 0,
				z: 0
			}
		})
	},
	{
		id: "crouch",
		name: "Crouching",
		pose: P({
			"upperLeg.L": {
				x: -70,
				y: 4,
				z: 6
			},
			"upperLeg.R": {
				x: -70,
				y: -4,
				z: -6
			},
			"lowerLeg.L": {
				x: 120,
				y: 0,
				z: 0
			},
			"lowerLeg.R": {
				x: 120,
				y: 0,
				z: 0
			},
			"foot.L": {
				x: 20,
				y: 0,
				z: 0
			},
			"foot.R": {
				x: 20,
				y: 0,
				z: 0
			},
			"upperArm.L": {
				x: 20,
				y: 15,
				z: -40
			},
			"upperArm.R": {
				x: 20,
				y: -15,
				z: 40
			},
			"lowerArm.L": {
				x: 0,
				y: -40,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 40,
				z: 0
			},
			spine: {
				x: 22,
				y: 0,
				z: 0
			},
			chest: {
				x: 12,
				y: 0,
				z: 0
			}
		})
	},
	{
		id: "raise",
		name: "Arms raised",
		pose: P({
			"upperArm.L": {
				x: 0,
				y: 10,
				z: 85
			},
			"upperArm.R": {
				x: 0,
				y: -10,
				z: -85
			},
			"lowerArm.L": {
				x: 0,
				y: -12,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 12,
				z: 0
			}
		})
	},
	{
		id: "fight",
		name: "Fighting stance",
		pose: P({
			"upperLeg.L": {
				x: -22,
				y: 8,
				z: 8
			},
			"upperLeg.R": {
				x: 12,
				y: -6,
				z: -6
			},
			"lowerLeg.L": {
				x: 30,
				y: 0,
				z: 0
			},
			"lowerLeg.R": {
				x: 18,
				y: 0,
				z: 0
			},
			"upperArm.L": {
				x: 50,
				y: -20,
				z: -35
			},
			"upperArm.R": {
				x: -10,
				y: 30,
				z: 28
			},
			"lowerArm.L": {
				x: 0,
				y: -85,
				z: 0
			},
			"lowerArm.R": {
				x: 0,
				y: 95,
				z: 0
			},
			spine: {
				x: 10,
				y: 16,
				z: -4
			},
			head: {
				x: -4,
				y: -10,
				z: 0
			}
		}, "fist")
	}
];
function poseById(id) {
	return POSE_PRESETS.find((p) => p.id === id)?.pose;
}
/**
* Project a world-space point with the same math Three.js uses for `project()`:
* world → camera (camera looks down its local −Z) → NDC → pixels with Y down.
* A point is behind the camera when its camera-space Z is ≥ 0 (on the camera
* plane or further back). Those keypoints are omitted from the OpenPose image.
*/
function projectToPixel(point, camera, width, height) {
	camera.updateMatrixWorld();
	const behind = point.clone().applyMatrix4(camera.matrixWorldInverse).z >= -1e-4;
	const ndc = point.clone().project(camera);
	return {
		x: (ndc.x * .5 + .5) * width,
		y: (1 - (ndc.y * .5 + .5)) * height,
		behind
	};
}
function insideFrame(p, width, height, margin = 0) {
	return p.x >= -margin && p.y >= -margin && p.x <= width + margin && p.y <= height + margin;
}
var DEG = Math.PI / 180;
var MARKER_GEO = new SphereGeometry(1, 8, 6);
var WIRE_VERT = `
#include <skinning_pars_vertex>
attribute vec3 barycentric;
varying vec3 vBary;
void main() {
  #include <begin_vertex>
  #include <skinbase_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  vBary = barycentric;
}
`;
var WIRE_FRAG = `
precision highp float;
varying vec3 vBary;
uniform vec3 uColor;
uniform float uThickness;
uniform float uAA;
void main() {
  vec3 fw = fwidth(vBary);
  float edge = min(vBary.x, min(vBary.y, vBary.z));
  float w = min(fw.x, min(fw.y, fw.z)) * uThickness;
  if (uAA > 0.5) {
    float a = 1.0 - smoothstep(w * 0.25, w, edge);
    if (a < 0.05) discard;
    gl_FragColor = vec4(uColor, 1.0);
  } else {
    if (edge > w) discard;
    gl_FragColor = vec4(uColor, 1.0);
  }
}
`;
var DEPTH_VERT = `
#include <skinning_pars_vertex>
varying float vViewZ;
void main() {
  #include <begin_vertex>
  #include <skinbase_vertex>
  #include <skinning_vertex>
  vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
  vViewZ = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;
var DEPTH_FRAG = `
precision highp float;
varying float vViewZ;
uniform float uNear;
uniform float uFar;
void main() {
  float d = clamp((vViewZ - uNear) / max(0.0001, uFar - uNear), 0.0, 1.0);
  float w = 1.0 - d;
  gl_FragColor = vec4(w, w, w, 1.0);
}
`;
function createDepthMaterial() {
	return new ShaderMaterial({
		uniforms: {
			uNear: { value: .1 },
			uFar: { value: 10 }
		},
		vertexShader: DEPTH_VERT,
		fragmentShader: DEPTH_FRAG
	});
}
function skinTint(hex) {
	const tint = new Color(hex);
	return new Color("#d2b29c").lerp(tint, .38);
}
var FigureView = class {
	data;
	group = new Group();
	bones = /* @__PURE__ */ new Map();
	markers = /* @__PURE__ */ new Map();
	targets = /* @__PURE__ */ new Map();
	mesh;
	beauty;
	wire;
	mask;
	normal;
	skeleton;
	segments = [];
	segMap = /* @__PURE__ */ new Map();
	layoutKey = "";
	boneList = [];
	/** While a gizmo drags an IK helper, don't overwrite its position. */
	holdTarget = null;
	constructor(data) {
		this.data = data;
		this.beauty = new MeshStandardMaterial({
			color: skinTint(data.color),
			roughness: .64,
			metalness: .02
		});
		this.wire = new ShaderMaterial({
			uniforms: {
				uColor: { value: new Color("#ffffff") },
				uThickness: { value: 1.4 },
				uAA: { value: 1 }
			},
			vertexShader: WIRE_VERT,
			fragmentShader: WIRE_FRAG,
			side: 2,
			polygonOffset: true,
			polygonOffsetFactor: -2,
			polygonOffsetUnits: -2
		});
		this.mask = new MeshBasicMaterial({ color: data.color });
		this.normal = new MeshNormalMaterial({ side: 2 });
		this.mesh = new SkinnedMesh();
		this.skeleton = new Skeleton([]);
		this.group.add(this.mesh);
		this.group.name = data.id;
		this.rebuild(true);
		for (const key of [
			"handL",
			"handR",
			"footL",
			"footR",
			"head",
			"pelvis"
		]) {
			const o = new Object3D();
			o.name = key;
			this.group.add(o);
			this.targets.set(key, o);
		}
	}
	/** Bone quaternions → user-pose eulers (stoop subtracted by the caller if needed). */
	readEuler(name) {
		const b = this.bones.get(name);
		if (!b) return {
			x: 0,
			y: 0,
			z: 0
		};
		const e = new Euler().setFromQuaternion(b.quaternion, "XYZ");
		return {
			x: e.x / DEG,
			y: e.y / DEG,
			z: e.z / DEG
		};
	}
	rebuild(force = false) {
		const key = JSON.stringify(this.data.params);
		if (!force && key === this.layoutKey) return;
		this.layoutKey = key;
		this.segments = layoutFigure(this.data.params);
		this.segMap = segmentMap(this.segments);
		if (this.bones.size === 0) this.createBones();
		this.applyRestPositions(false);
		for (const b of this.boneList) b.quaternion.identity();
		this.mesh.updateWorldMatrix(true, true);
		const index = new Map(this.boneList.map((b, i) => [b.name, i]));
		const geom = buildFigureGeometry(this.segments, this.data.params, index);
		this.mesh.geometry.dispose();
		this.mesh.geometry = geom;
		this.mesh.material = this.beauty;
		this.mesh.frustumCulled = false;
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.skeleton = new Skeleton(this.boneList);
		this.mesh.bind(this.skeleton);
		this.beauty.color.copy(skinTint(this.data.color));
		this.mask.color.set(this.data.color);
	}
	createBones() {
		for (const seg of this.segments) {
			const bone = new Bone();
			bone.name = seg.name;
			this.bones.set(seg.name, bone);
		}
		let root = null;
		for (const seg of this.segments) {
			const bone = this.bones.get(seg.name);
			if (seg.parent) this.bones.get(seg.parent).add(bone);
			else root = bone;
		}
		if (!root) throw new Error("rig has no root");
		this.mesh.add(root);
		this.boneList = this.segments.map((s) => this.bones.get(s.name));
		const markerMat = () => new MeshBasicMaterial({
			color: this.data.color,
			depthTest: true,
			toneMapped: false
		});
		for (const seg of this.segments) {
			const m = new Mesh(MARKER_GEO, markerMat());
			m.name = seg.name;
			m.userData.figureId = this.data.id;
			m.userData.bone = seg.name;
			const finger = /\d\.[LR]$/.test(seg.name);
			m.userData.finger = finger;
			this.group.add(m);
			this.markers.set(seg.name, m);
		}
	}
	applyRestPositions(withOffset) {
		for (const seg of this.segments) {
			const bone = this.bones.get(seg.name);
			if (!bone) continue;
			if (!seg.parent) bone.position.set(seg.head.x, seg.head.y, seg.head.z);
			else {
				const p = this.segMap.get(seg.parent);
				bone.position.set(seg.head.x - p.head.x, seg.head.y - p.head.y, seg.head.z - p.head.z);
			}
		}
		if (withOffset) {
			const hips = this.bones.get("hips");
			const seg = this.segMap.get("hips");
			if (hips && seg) {
				const o = this.data.pelvisOffset;
				hips.position.set(seg.head.x + o.x, seg.head.y + o.y, seg.head.z + o.z);
			}
		}
	}
	/** Write FK (and IK, if enabled) onto the skeleton. Call once per frame. */
	updateSkeleton(jointLimits, skipBone) {
		this.group.position.set(this.data.position.x, this.data.position.y, this.data.position.z);
		this.group.rotation.y = this.data.rotationY * DEG;
		this.group.scale.setScalar(this.data.scale);
		this.group.visible = this.data.visible;
		this.applyRestPositions(true);
		const e = new Euler(0, 0, 0, "XYZ");
		for (const seg of this.segments) {
			const bone = this.bones.get(seg.name);
			if (bone.name === skipBone) continue;
			const deg = composedEuler(seg.name, this.data.pose, this.data.params, jointLimits);
			e.set(deg.x * DEG, deg.y * DEG, deg.z * DEG);
			bone.quaternion.setFromEuler(e);
		}
		this.mesh.updateWorldMatrix(true, true);
		if (this.data.ik) solveIk(this.bones, this.segMap, this.data.ikTargets, this.mesh);
		this.group.updateWorldMatrix(true, true);
		this.syncMarkers();
		this.syncTargetHelpers();
	}
	syncMarkers() {
		const h = Math.max(.4, this.data.params.heightCm / 100);
		const tmp = new Vector3();
		for (const [name, marker] of this.markers) {
			this.bones.get(name).getWorldPosition(tmp);
			this.group.worldToLocal(tmp);
			marker.position.copy(tmp);
			const s = (marker.userData.finger === true ? .012 : .02) * h * this.data.scale;
			marker.scale.setScalar(s);
			marker.visible = this.data.visible;
		}
	}
	syncTargetHelpers() {
		const put = (key, v) => {
			if (this.holdTarget === key) return;
			const o = this.targets.get(key);
			if (o) o.position.set(v.x, v.y, v.z);
		};
		put("handL", this.data.ikTargets.handL);
		put("handR", this.data.ikTargets.handR);
		put("footL", this.data.ikTargets.footL);
		put("footR", this.data.ikTargets.footR);
		put("head", this.data.ikTargets.head);
		const hips = this.segMap.get("hips");
		if (hips) {
			const o = this.data.pelvisOffset;
			put("pelvis", {
				x: hips.head.x + o.x,
				y: hips.head.y + o.y,
				z: hips.head.z + o.z
			});
		}
	}
	/** Sample current joint positions into IK targets so enabling IK does not pop. */
	captureTargets() {
		const localOf = (boneName) => {
			const bone = this.bones.get(boneName);
			const p = new Vector3();
			if (!bone) return {
				x: 0,
				y: 0,
				z: 0
			};
			bone.getWorldPosition(p);
			this.mesh.worldToLocal(p);
			return {
				x: p.x,
				y: p.y,
				z: p.z
			};
		};
		this.data.ikTargets = {
			handL: localOf("hand.L"),
			handR: localOf("hand.R"),
			footL: localOf("foot.L"),
			footR: localOf("foot.R"),
			head: localOf("head"),
			pelvis: { ...this.data.pelvisOffset }
		};
	}
	/** Bake solved bone quaternions back into the stored pose (stoop removed). */
	bakePose(jointLimits) {
		composedEuler("spine", {}, this.data.params, false);
		for (const seg of this.segments) {
			const total = this.readEuler(seg.name);
			const stoop = composedEuler(seg.name, {}, this.data.params, false);
			let user = {
				x: total.x - stoop.x,
				y: total.y - stoop.y,
				z: total.z - stoop.z
			};
			if (jointLimits) {
				const withStoop = composedEuler(seg.name, { [seg.name]: user }, this.data.params, true);
				user = {
					x: withStoop.x - stoop.x,
					y: withStoop.y - stoop.y,
					z: withStoop.z - stoop.z
				};
			}
			const eps = .05;
			if (Math.abs(user.x) < eps && Math.abs(user.y) < eps && Math.abs(user.z) < eps) delete this.data.pose[seg.name];
			else this.data.pose[seg.name] = user;
		}
	}
	localPoint(boneName, offset, out) {
		const bone = this.bones.get(boneName);
		if (!bone) return null;
		out.set(offset.x, offset.y, offset.z);
		bone.localToWorld(out);
		return out;
	}
	tipWorld(boneName, out) {
		const seg = this.segMap.get(boneName);
		const bone = this.bones.get(boneName);
		if (!seg || !bone) return null;
		out.set(seg.tail.x - seg.head.x, seg.tail.y - seg.head.y, seg.tail.z - seg.head.z);
		bone.localToWorld(out);
		return out;
	}
	samplePose(camera, width, height, hideOccluded, raycaster) {
		const project = (world) => {
			const px = projectToPixel(world, camera, width, height);
			if (px.behind || !insideFrame(px, width, height, 2)) return {
				x: 0,
				y: 0,
				c: 0
			};
			if (hideOccluded && this.occluded(world, camera, raycaster)) return {
				x: 0,
				y: 0,
				c: 0
			};
			return {
				x: px.x,
				y: px.y,
				c: 1
			};
		};
		const joint = (name) => {
			const bone = this.bones.get(name);
			if (!bone) return {
				x: 0,
				y: 0,
				c: 0
			};
			const p = new Vector3();
			bone.getWorldPosition(p);
			return project(p);
		};
		const anchor = (key) => {
			const off = headAnchors(headLength(this.segments))[key];
			const p = new Vector3();
			if (!off || !this.localPoint("head", off, p)) return {
				x: 0,
				y: 0,
				c: 0
			};
			return project(p);
		};
		const ls = joint("upperArm.L");
		const rs = joint("upperArm.R");
		let neck = {
			x: 0,
			y: 0,
			c: 0
		};
		if (ls.c > 0 && rs.c > 0) neck = {
			x: (ls.x + rs.x) / 2,
			y: (ls.y + rs.y) / 2,
			c: 1
		};
		else if (ls.c > 0) neck = { ...ls };
		else if (rs.c > 0) neck = { ...rs };
		return {
			body: [
				anchor("nose"),
				neck,
				rs,
				joint("lowerArm.R"),
				joint("hand.R"),
				ls,
				joint("lowerArm.L"),
				joint("hand.L"),
				joint("upperLeg.R"),
				joint("lowerLeg.R"),
				joint("foot.R"),
				joint("upperLeg.L"),
				joint("lowerLeg.L"),
				joint("foot.L"),
				anchor("right_eye"),
				anchor("left_eye"),
				anchor("right_ear"),
				anchor("left_ear")
			],
			handL: this.sampleHand("L", project),
			handR: this.sampleHand("R", project),
			face: this.sampleFace(project)
		};
	}
	sampleHand(side, project) {
		const out = [];
		out.push(this.projectBone(`hand.${side}`, project));
		for (const finger of [
			"thumb",
			"index",
			"middle",
			"ring",
			"pinky"
		]) for (let i = 1; i <= 3; i++) {
			const name = `${finger}${i}.${side}`;
			if (i < 3) out.push(this.projectBone(name, project));
			else {
				out.push(this.projectBone(name, project));
				const tip = new Vector3();
				if (this.tipWorld(name, tip)) out.push(project(tip));
				else out.push({
					x: 0,
					y: 0,
					c: 0
				});
			}
		}
		return out;
	}
	projectBone(name, project) {
		const bone = this.bones.get(name);
		if (!bone) return {
			x: 0,
			y: 0,
			c: 0
		};
		const p = new Vector3();
		bone.getWorldPosition(p);
		return project(p);
	}
	sampleFace(project) {
		return faceLandmarks(headLength(this.segments)).map((off) => {
			const p = new Vector3();
			if (!this.localPoint("head", off, p)) return {
				x: 0,
				y: 0,
				c: 0
			};
			return project(p);
		});
	}
	occluded(point, camera, raycaster) {
		const dir = point.clone().sub(camera.position);
		const dist = dir.length();
		if (dist < 1e-4) return false;
		dir.multiplyScalar(1 / dist);
		const slop = Math.max(.08, this.data.params.heightCm / 100 * .09);
		raycaster.set(camera.position, dir);
		raycaster.far = Math.max(.01, dist - slop);
		return raycaster.intersectObject(this.mesh, false).length > 0;
	}
	/** Lowest sole estimate in world Y, for snap-to-ground. */
	soleY() {
		let min = Infinity;
		const p = new Vector3();
		for (const side of ["L", "R"]) {
			const bone = this.bones.get(`foot.${side}`);
			const seg = this.segMap.get(`foot.${side}`);
			if (!bone || !seg) continue;
			bone.getWorldPosition(p);
			min = Math.min(min, p.y - Math.max(seg.rz0, seg.rx0) * this.data.scale);
		}
		return min;
	}
	dispose() {
		this.mesh.geometry.dispose();
		this.beauty.dispose();
		this.wire.dispose();
		this.mask.dispose();
		this.normal.dispose();
		for (const m of this.markers.values()) m.material.dispose();
		this.group.removeFromParent();
	}
	setMarkerStyle(selectedBone, hovered, show) {
		for (const [name, marker] of this.markers) {
			const mat = marker.material;
			const selected = name === selectedBone;
			marker.visible = show && this.data.visible && (selected || !marker.userData.finger || show);
			if (!show) marker.visible = false;
			mat.color.set(selected ? "#ffe08a" : name === hovered ? "#ffffff" : this.data.color);
			const base = marker.userData.finger ? .012 : .02;
			const h = Math.max(.4, this.data.params.heightCm / 100);
			marker.scale.setScalar(base * h * (selected ? 1.45 : 1));
		}
	}
};
/** RGB, full brightness. Index matches both keypoints and the limb list below. */
var BODY_COLORS = [
	[
		255,
		0,
		0
	],
	[
		255,
		85,
		0
	],
	[
		255,
		170,
		0
	],
	[
		255,
		255,
		0
	],
	[
		170,
		255,
		0
	],
	[
		85,
		255,
		0
	],
	[
		0,
		255,
		0
	],
	[
		0,
		255,
		85
	],
	[
		0,
		255,
		170
	],
	[
		0,
		255,
		255
	],
	[
		0,
		170,
		255
	],
	[
		0,
		85,
		255
	],
	[
		0,
		0,
		255
	],
	[
		85,
		0,
		255
	],
	[
		170,
		0,
		255
	],
	[
		255,
		0,
		255
	],
	[
		255,
		0,
		170
	],
	[
		255,
		0,
		85
	]
];
/** 1-indexed into COCO-18, from controlnet_aux draw_bodypose. */
var BODY_LIMBS = [
	[2, 3],
	[2, 6],
	[3, 4],
	[4, 5],
	[6, 7],
	[7, 8],
	[2, 9],
	[9, 10],
	[10, 11],
	[2, 12],
	[12, 13],
	[13, 14],
	[2, 1],
	[1, 15],
	[15, 17],
	[1, 16],
	[16, 18]
];
var HAND_EDGES = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 4],
	[0, 5],
	[5, 6],
	[6, 7],
	[7, 8],
	[0, 9],
	[9, 10],
	[10, 11],
	[11, 12],
	[0, 13],
	[13, 14],
	[14, 15],
	[15, 16],
	[0, 17],
	[17, 18],
	[18, 19],
	[19, 20]
];
function flattenKeys(keys, count) {
	const out = [];
	for (let i = 0; i < count; i++) {
		const k = keys[i];
		if (!k || k.c <= 0) out.push(0, 0, 0);
		else out.push(k.x, k.y, k.c);
	}
	return out;
}
/**
* OpenPose-style JSON. `pose_keypoints_2d` is COCO-18 as flat [x, y, confidence]
* in pixels. Hand (21) and face (68) arrays are included when `handsFace` is set.
* Canvas size is recorded so a loader does not have to guess normalization.
*/
function openPoseJson(people, width, height, handsFace) {
	return JSON.stringify({
		version: 1.3,
		canvas_width: width,
		canvas_height: height,
		people: people.map((p) => ({
			person_id: [-1],
			pose_keypoints_2d: flattenKeys(p.body, 18),
			face_keypoints_2d: handsFace ? flattenKeys(p.face, 68) : [],
			hand_left_keypoints_2d: handsFace ? flattenKeys(p.handL, 21) : [],
			hand_right_keypoints_2d: handsFace ? flattenKeys(p.handR, 21) : [],
			pose_keypoints_3d: [],
			face_keypoints_3d: [],
			hand_left_keypoints_3d: [],
			hand_right_keypoints_3d: []
		}))
	}, null, 2);
}
function hsvToRgb(h, s, v) {
	const i = Math.floor(h * 6);
	const f = h * 6 - i;
	const p = v * (1 - s);
	const q = v * (1 - f * s);
	const t = v * (1 - (1 - f) * s);
	let r = v;
	let g = t;
	let b = p;
	switch (i % 6) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;
		case 1:
			r = q;
			g = v;
			b = p;
			break;
		case 2:
			r = p;
			g = v;
			b = t;
			break;
		case 3:
			r = p;
			g = q;
			b = v;
			break;
		case 4:
			r = t;
			g = p;
			b = v;
			break;
		default:
			r = v;
			g = p;
			b = q;
	}
	return [
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255)
	];
}
function alive(k) {
	return !!k && k.c > 0;
}
function drawOpenPose(ctx, people, width, height, opts) {
	if (opts.clear) {
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, width, height);
	}
	const scale = Math.min(width, height) / 512;
	const stick = Math.max(1, 4 * scale);
	const dot = Math.max(1, 4 * scale);
	const faceDot = Math.max(1, 3 * scale);
	const handWidth = Math.max(1, 2 * scale);
	for (const person of people) {
		ctx.save();
		BODY_LIMBS.forEach(([a, b], i) => {
			const k1 = person.body[a - 1];
			const k2 = person.body[b - 1];
			if (!alive(k1) || !alive(k2)) return;
			const color = BODY_COLORS[i] ?? BODY_COLORS[0];
			const dx = k2.x - k1.x;
			const dy = k2.y - k1.y;
			const length = Math.hypot(dx, dy);
			if (length < .5) return;
			ctx.save();
			ctx.translate((k1.x + k2.x) / 2, (k1.y + k2.y) / 2);
			ctx.rotate(Math.atan2(dy, dx));
			ctx.fillStyle = `rgb(${Math.round(color[0] * .6)},${Math.round(color[1] * .6)},${Math.round(color[2] * .6)})`;
			ctx.beginPath();
			ctx.ellipse(0, 0, length / 2, stick, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		});
		person.body.forEach((k, i) => {
			if (!alive(k)) return;
			const color = BODY_COLORS[i] ?? [
				255,
				255,
				255
			];
			ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
			ctx.beginPath();
			ctx.arc(k.x, k.y, dot, 0, Math.PI * 2);
			ctx.fill();
		});
		if (opts.handsFace) {
			for (const hand of [person.handL, person.handR]) {
				HAND_EDGES.forEach(([e1, e2], ie) => {
					const k1 = hand[e1];
					const k2 = hand[e2];
					if (!alive(k1) || !alive(k2)) return;
					const [r, g, bl] = hsvToRgb(ie / HAND_EDGES.length, 1, 1);
					ctx.strokeStyle = `rgb(${r},${g},${bl})`;
					ctx.lineWidth = handWidth;
					ctx.lineCap = "round";
					ctx.beginPath();
					ctx.moveTo(k1.x, k1.y);
					ctx.lineTo(k2.x, k2.y);
					ctx.stroke();
				});
				ctx.fillStyle = "rgb(0,0,255)";
				for (const k of hand) {
					if (!alive(k)) continue;
					ctx.beginPath();
					ctx.arc(k.x, k.y, dot, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			ctx.fillStyle = "rgb(255,255,255)";
			for (const k of person.face) {
				if (!alive(k)) continue;
				ctx.beginPath();
				ctx.arc(k.x, k.y, faceDot, 0, Math.PI * 2);
				ctx.fill();
			}
		}
		ctx.restore();
	}
}
/** Fraction of frame height covered by confident body keypoints. Below ~0.18 is a weak ControlNet signal. */
function bodyCoverage(people, height) {
	let minY = Infinity;
	let maxY = -Infinity;
	for (const p of people) for (const k of p.body) {
		if (k.c <= 0) continue;
		minY = Math.min(minY, k.y);
		maxY = Math.max(maxY, k.y);
	}
	if (!Number.isFinite(minY)) return 0;
	return (maxY - minY) / Math.max(1, height);
}
/** 8-bit RGB PNG (color type 2, no alpha). Stored zlib blocks — no compression library. */
var CRC_TABLE = (() => {
	const table = /* @__PURE__ */ new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		table[n] = c >>> 0;
	}
	return table;
})();
function crc32$1(buf) {
	let c = 4294967295;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 255] ^ c >>> 8;
	return (c ^ 4294967295) >>> 0;
}
function adler32(data) {
	let a = 1;
	let b = 0;
	const MOD = 65521;
	for (let i = 0; i < data.length; i++) {
		a += data[i];
		b += a;
		if ((i & 4095) === 0) {
			a %= MOD;
			b %= MOD;
		}
	}
	a %= MOD;
	b %= MOD;
	return (b << 16 | a) >>> 0;
}
function u32$1(n) {
	return new Uint8Array([
		n >>> 24 & 255,
		n >>> 16 & 255,
		n >>> 8 & 255,
		n & 255
	]);
}
function chunk(type, data) {
	const t = /* @__PURE__ */ new Uint8Array(4);
	for (let i = 0; i < 4; i++) t[i] = type.charCodeAt(i);
	const body = new Uint8Array(4 + data.length);
	body.set(t, 0);
	body.set(data, 4);
	const crc = crc32$1(body);
	const out = new Uint8Array(8 + data.length + 4);
	out.set(u32$1(data.length), 0);
	out.set(body, 4);
	out.set(u32$1(crc), 4 + body.length);
	return out;
}
function zlibStore(data) {
	const parts = [new Uint8Array([120, 1])];
	const max = 65535;
	for (let i = 0; i < data.length || i === 0 && data.length === 0; i += max) {
		const end = Math.min(data.length, i + max);
		const len = end - i;
		const last = end >= data.length;
		const block = new Uint8Array(5 + len);
		block[0] = last ? 1 : 0;
		block[1] = len & 255;
		block[2] = len >> 8 & 255;
		const nlen = len ^ 65535;
		block[3] = nlen & 255;
		block[4] = nlen >> 8 & 255;
		block.set(data.subarray(i, end), 5);
		parts.push(block);
		if (data.length === 0) break;
	}
	const sum = adler32(data);
	parts.push(u32$1(sum));
	let n = 0;
	for (const p of parts) n += p.length;
	const out = new Uint8Array(n);
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
}
/** `rgb` is row-major, tightly packed, length width*height*3, top row first. */
function encodePngRGB(width, height, rgb) {
	if (rgb.length !== width * height * 3) throw new Error(`RGB buffer length ${rgb.length} != ${width}*${height}*3`);
	const stride = width * 3;
	const raw = new Uint8Array((stride + 1) * height);
	for (let y = 0; y < height; y++) {
		const dst = y * (stride + 1);
		raw[dst] = 0;
		raw.set(rgb.subarray(y * stride, y * stride + stride), dst + 1);
	}
	const ihdr = /* @__PURE__ */ new Uint8Array(13);
	ihdr.set(u32$1(width), 0);
	ihdr.set(u32$1(height), 4);
	ihdr[8] = 8;
	ihdr[9] = 2;
	ihdr[10] = 0;
	ihdr[11] = 0;
	ihdr[12] = 0;
	const parts = [
		new Uint8Array([
			137,
			80,
			78,
			71,
			13,
			10,
			26,
			10
		]),
		chunk("IHDR", ihdr),
		chunk("IDAT", zlibStore(raw)),
		chunk("IEND", /* @__PURE__ */ new Uint8Array())
	];
	let n = 0;
	for (const p of parts) n += p.length;
	const out = new Uint8Array(n);
	let o = 0;
	for (const p of parts) {
		out.set(p, o);
		o += p.length;
	}
	return out;
}
function pngBlob(width, height, rgb) {
	const bytes = encodePngRGB(width, height, rgb);
	return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], { type: "image/png" });
}
/** Drop alpha and, for WebGL readbacks, flip bottom-up rows. */
function rgbaToRgb(src, width, height, flipY) {
	const rgb = new Uint8Array(width * height * 3);
	for (let y = 0; y < height; y++) {
		const sy = flipY ? height - 1 - y : y;
		for (let x = 0; x < width; x++) {
			const i = (sy * width + x) * 4;
			const o = (y * width + x) * 3;
			rgb[o] = src[i];
			rgb[o + 1] = src[i + 1];
			rgb[o + 2] = src[i + 2];
		}
	}
	return rgb;
}
function canvasToRgb(canvas) {
	const w = canvas.width;
	const h = canvas.height;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) throw new Error("2D canvas unavailable");
	const img = ctx.getImageData(0, 0, w, h);
	return rgbaToRgb(new Uint8Array(img.data), w, h, false);
}
/** Export resolutions. SD1.5 likes 512–768; SDXL likes ~1 megapixel buckets. All presets are multiples of 64. */
var RESOLUTIONS = [
	{
		id: "512",
		width: 512,
		height: 512,
		label: "512 × 512"
	},
	{
		id: "512x768",
		width: 512,
		height: 768,
		label: "512 × 768"
	},
	{
		id: "768x512",
		width: 768,
		height: 512,
		label: "768 × 512"
	},
	{
		id: "768",
		width: 768,
		height: 768,
		label: "768 × 768"
	},
	{
		id: "1024",
		width: 1024,
		height: 1024,
		label: "1024 × 1024"
	},
	{
		id: "832x1216",
		width: 832,
		height: 1216,
		label: "832 × 1216"
	},
	{
		id: "1216x832",
		width: 1216,
		height: 832,
		label: "1216 × 832"
	},
	{
		id: "896x1152",
		width: 896,
		height: 1152,
		label: "896 × 1152"
	},
	{
		id: "1152x896",
		width: 1152,
		height: 896,
		label: "1152 × 896"
	},
	{
		id: "1024x1536",
		width: 1024,
		height: 1536,
		label: "1024 × 1536"
	},
	{
		id: "custom",
		width: 768,
		height: 768,
		label: "Custom"
	}
];
function snapResolution(width, height) {
	const w0 = Math.max(64, Math.round(Number(width) || 512));
	const h0 = Math.max(64, Math.round(Number(height) || 512));
	const w = Math.max(64, Math.round(w0 / 8) * 8);
	const h = Math.max(64, Math.round(h0 / 8) * 8);
	const cap = 4096;
	return {
		width: Math.min(cap, w),
		height: Math.min(cap, h),
		snapped: w !== w0 || h !== h0,
		warn64: w % 64 !== 0 || h % 64 !== 0
	};
}
/**
* Crop of the live view that matches an offscreen export.
* Vertical FOV is preserved when the export is narrower than the view (crop the sides).
* When the export is wider, horizontal FOV is preserved and the export vertical FOV shrinks
* so the pixels inside the crop match exactly.
*/
function exportCameraFit(viewW, viewH, expW, expH, fovDeg) {
	const viewAspect = viewW / Math.max(1, viewH);
	const expAspect = expW / Math.max(1, expH);
	if (expAspect <= viewAspect + 1e-6) {
		const h = viewH;
		const w = viewH * expAspect;
		return {
			fov: fovDeg,
			x: (viewW - w) / 2,
			y: 0,
			w,
			h
		};
	}
	const w = viewW;
	const h = viewW / expAspect;
	const vFov = fovDeg * Math.PI / 180;
	const hFov = 2 * Math.atan(Math.tan(vFov / 2) * viewAspect);
	return {
		fov: 2 * Math.atan(Math.tan(hFov / 2) / expAspect) * 180 / Math.PI,
		x: 0,
		y: (viewH - h) / 2,
		w,
		h
	};
}
var FIGURE_COLORS = [
	"#3ecfb2",
	"#e0a045",
	"#d4654f",
	"#7aa2d4"
];
var BODY_PRESETS = [
	{
		id: "adult-f",
		name: "Adult female average",
		params: {
			sex: .05,
			age: 30,
			heightCm: 163,
			mass: .42,
			muscle: .28,
			shoulder: 1,
			hip: 1.02,
			torso: 1,
			leg: 1
		}
	},
	{
		id: "adult-m",
		name: "Adult male muscular",
		params: {
			sex: 1,
			age: 28,
			heightCm: 181,
			mass: .55,
			muscle: .88,
			shoulder: 1.12,
			hip: .96,
			torso: 1.02,
			leg: 1
		}
	},
	{
		id: "child",
		name: "Child 6y",
		params: {
			sex: .5,
			age: 6,
			heightCm: 115,
			mass: .38,
			muscle: .18,
			shoulder: .98,
			hip: 1,
			torso: 1,
			leg: .98
		}
	},
	{
		id: "teen",
		name: "Teen male slim",
		params: {
			sex: .85,
			age: 15,
			heightCm: 170,
			mass: .22,
			muscle: .32,
			shoulder: .96,
			hip: .94,
			torso: 1,
			leg: 1.05
		}
	},
	{
		id: "elder-f",
		name: "Elderly female",
		params: {
			sex: .08,
			age: 78,
			heightCm: 156,
			mass: .5,
			muscle: .12,
			shoulder: .94,
			hip: 1.06,
			torso: .96,
			leg: .97
		}
	},
	{
		id: "heavy-m",
		name: "Heavy adult male",
		params: {
			sex: .92,
			age: 45,
			heightCm: 178,
			mass: .94,
			muscle: .34,
			shoulder: 1.06,
			hip: 1.1,
			torso: 1.05,
			leg: .98
		}
	}
];
var ZERO_TARGETS = {
	handL: v3(),
	handR: v3(),
	footL: v3(),
	footR: v3(),
	head: v3(),
	pelvis: v3()
};
function defaultExport() {
	return {
		preset: "768",
		width: 768,
		height: 768,
		includeHandsFace: false,
		hideOccluded: false,
		wireThickness: 1.35,
		wireInvert: false,
		wireColored: false,
		wireXray: false,
		wireAA: false,
		depthAuto: true,
		overlay: "off"
	};
}
function makeFigure(index, presetId = "adult-f") {
	const preset = BODY_PRESETS.find((p) => p.id === presetId) ?? BODY_PRESETS[0];
	const pose = { ...poseById("stand") ?? {} };
	writeHand(pose, "L", "relaxed");
	writeHand(pose, "R", "relaxed");
	return {
		id: `f${index}`,
		name: `Figure ${index}`,
		color: FIGURE_COLORS[(index - 1) % FIGURE_COLORS.length],
		visible: true,
		params: clampParams({ ...preset.params }),
		position: v3((index - 1) * .85 - 0, 0, 0),
		rotationY: 0,
		scale: 1,
		pose,
		ik: false,
		ikTargets: {
			...ZERO_TARGETS,
			handL: v3(),
			handR: v3(),
			footL: v3(),
			footR: v3(),
			head: v3(),
			pelvis: v3()
		},
		pelvisOffset: v3()
	};
}
function defaultScene() {
	return {
		figures: [makeFigure(1, "adult-f")],
		selection: {
			figureId: "f1",
			bone: null
		},
		tool: "rotate",
		jointLimits: true,
		showJoints: true,
		showGrid: true,
		export: defaultExport(),
		warning: ""
	};
}
function stamp() {
	const d = /* @__PURE__ */ new Date();
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function downloadBlob(blob, filename) {
	const a = document.createElement("a");
	const url = URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function clone(v) {
	return JSON.parse(JSON.stringify(v));
}
/** Store-only ZIP (method 0). Enough for a handful of PNGs, no extra dependency. */
function crc32(buf) {
	let c = 4294967295;
	for (let i = 0; i < buf.length; i++) {
		c ^= buf[i];
		for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
	}
	return (c ^ 4294967295) >>> 0;
}
function u16(n) {
	return [n & 255, n >> 8 & 255];
}
function u32(n) {
	return [
		n & 255,
		n >> 8 & 255,
		n >> 16 & 255,
		n >> 24 & 255
	];
}
function encodeZip(items) {
	const local = [];
	const central = [];
	let offset = 0;
	for (const item of items) {
		const name = new TextEncoder().encode(item.name);
		const crc = crc32(item.data);
		const localHdr = [
			...u32(67324752),
			...u16(20),
			...u16(0),
			...u16(0),
			...u16(0),
			...u16(0),
			...u32(crc),
			...u32(item.data.length),
			...u32(item.data.length),
			...u16(name.length),
			...u16(0)
		];
		const localBytes = new Uint8Array(localHdr.length + name.length + item.data.length);
		localBytes.set(localHdr, 0);
		localBytes.set(name, localHdr.length);
		localBytes.set(item.data, localHdr.length + name.length);
		local.push(localBytes);
		const centralHdr = [
			...u32(33639248),
			...u16(20),
			...u16(20),
			...u16(0),
			...u16(0),
			...u16(0),
			...u16(0),
			...u32(crc),
			...u32(item.data.length),
			...u32(item.data.length),
			...u16(name.length),
			...u16(0),
			...u16(0),
			...u16(0),
			...u16(0),
			...u32(0),
			...u32(offset),
			...Array.from(name)
		];
		central.push(...centralHdr);
		offset += localBytes.length;
	}
	const centralBytes = new Uint8Array(central);
	const end = [
		...u32(101010256),
		...u16(0),
		...u16(0),
		...u16(items.length),
		...u16(items.length),
		...u32(centralBytes.length),
		...u32(offset),
		...u16(0)
	];
	let n = centralBytes.length + end.length;
	for (const p of local) n += p.length;
	const out = new Uint8Array(n);
	let o = 0;
	for (const p of local) {
		out.set(p, o);
		o += p.length;
	}
	out.set(centralBytes, o);
	o += centralBytes.length;
	out.set(end, o);
	return out;
}
function zipBlob(items) {
	const bytes = encodeZip(items);
	return new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)], { type: "application/zip" });
}
/** Offscreen targets are linear, so keep the sRGB byte values we want in the PNG. */
function pngColor(hex) {
	const srgb = new Color();
	new Color(hex).getRGB(srgb, SRGBColorSpace);
	return new Color().setRGB(srgb.r, srgb.g, srgb.b, LinearSRGBColorSpace);
}
var IK_BONE = {
	"hand.L": "handL",
	"hand.R": "handR",
	"foot.L": "footL",
	"foot.R": "footR",
	head: "head",
	hips: "pelvis"
};
var DRIVEN = /* @__PURE__ */ new Set([
	"spine",
	"chest",
	"neck",
	"upperArm.L",
	"upperArm.R",
	"lowerArm.L",
	"lowerArm.R",
	"upperLeg.L",
	"upperLeg.R",
	"lowerLeg.L",
	"lowerLeg.R"
]);
var PoserEngine = class {
	state;
	snapshot;
	listeners = /* @__PURE__ */ new Set();
	views = [];
	nextId;
	scene = new Scene();
	camera;
	renderer;
	exporter;
	orbit;
	gizmo;
	grid;
	ground;
	helpers = [];
	raycaster = new Raycaster();
	pointer = new Vector2();
	keys = /* @__PURE__ */ new Set();
	fly = {
		yaw: 0,
		pitch: -.12,
		speed: 0
	};
	host;
	overlay;
	crop;
	hint;
	undoStack = [];
	redoStack = [];
	raf = 0;
	last = performance.now();
	skipBone = null;
	suppressPick = false;
	depthMat = createDepthMaterial();
	preview = {};
	previewTimer = 0;
	disposed = false;
	cameraDirty = false;
	depthScratch = new Vector3();
	constructor(host) {
		this.host = host;
		this.state = defaultScene();
		this.nextId = this.state.figures.length + 1;
		this.snapshot = {
			v: 1,
			state: this.state
		};
		this.scene.background = new Color("#14181d");
		this.camera = new PerspectiveCamera(50, 1, .05, 80);
		this.camera.position.set(1.55, 1.22, 3.15);
		this.renderer = new WebGLRenderer({
			antialias: true,
			alpha: false,
			preserveDrawingBuffer: true
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		this.renderer.outputColorSpace = SRGBColorSpace;
		this.renderer.toneMapping = 4;
		this.renderer.toneMappingExposure = 1.05;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = 1;
		this.renderer.domElement.className = "block h-full w-full";
		this.renderer.domElement.style.touchAction = "none";
		host.appendChild(this.renderer.domElement);
		this.exporter = new WebGLRenderer({
			antialias: false,
			alpha: false,
			preserveDrawingBuffer: false
		});
		this.exporter.outputColorSpace = LinearSRGBColorSpace;
		this.exporter.setPixelRatio(1);
		this.exporter.toneMapping = 0;
		this.overlay = document.createElement("canvas");
		this.overlay.className = "pointer-events-none absolute inset-0 h-full w-full";
		host.appendChild(this.overlay);
		this.crop = document.createElement("div");
		this.crop.className = "pointer-events-none absolute border border-accent";
		this.crop.style.boxShadow = "0 0 0 9999px rgba(8, 10, 12, 0.45)";
		host.appendChild(this.crop);
		this.hint = document.createElement("div");
		this.hint.className = "pointer-events-none absolute left-3 top-3 rounded-sm bg-surface/80 px-2 py-1 text-xs text-muted";
		host.appendChild(this.hint);
		const hemi = new HemisphereLight("#d5e2ea", "#3a342c", .85);
		const sun = new DirectionalLight("#fff6ea", 1.35);
		sun.position.set(2.4, 4.2, 2.2);
		sun.castShadow = true;
		sun.shadow.mapSize.set(2048, 2048);
		sun.shadow.camera.near = .2;
		sun.shadow.camera.far = 18;
		sun.shadow.camera.left = -6;
		sun.shadow.camera.right = 6;
		sun.shadow.camera.top = 6;
		sun.shadow.camera.bottom = -6;
		this.scene.add(hemi, sun);
		this.ground = new Mesh(new CircleGeometry(16, 64), new MeshStandardMaterial({
			color: "#1a1f24",
			roughness: 1
		}));
		this.ground.rotation.x = -Math.PI / 2;
		this.ground.receiveShadow = true;
		this.scene.add(this.ground);
		this.grid = new GridHelper(10, 20, 4477276, 2896956);
		this.grid.position.y = .001;
		this.scene.add(this.grid);
		this.helpers.push(this.ground, this.grid);
		this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbit.target.set(0, .95, 0);
		this.orbit.enableDamping = true;
		this.orbit.dampingFactor = .08;
		this.orbit.maxPolarAngle = Math.PI * .49;
		this.orbit.minDistance = .3;
		this.orbit.maxDistance = 30;
		this.orbit.update();
		this.orbit.addEventListener("change", () => {
			this.cameraDirty = true;
		});
		this.gizmo = new TransformControls(this.camera, this.renderer.domElement);
		this.scene.add(this.gizmo.getHelper());
		this.helpers.push(this.gizmo.getHelper());
		this.gizmo.addEventListener("dragging-changed", (event) => {
			const dragging = event.value;
			this.orbit.enabled = !dragging && this.mode === "orbit";
			if (dragging) this.pushHistory();
			else this.finishDrag();
		});
		this.gizmo.addEventListener("mouseDown", () => {
			this.suppressPick = true;
		});
		this.gizmo.addEventListener("objectChange", () => this.onGizmo());
		for (const fig of this.state.figures) this.attachView(fig, true);
		const canvas = this.renderer.domElement;
		canvas.addEventListener("pointerdown", this.onPointerDown);
		canvas.addEventListener("pointerup", this.onPointerUp);
		canvas.addEventListener("pointermove", this.onPointerMove);
		canvas.addEventListener("contextmenu", (e) => e.preventDefault());
		canvas.addEventListener("click", () => {
			if (this.mode === "fly") canvas.requestPointerLock();
		});
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
		document.addEventListener("pointerlockchange", this.onLock);
		window.addEventListener("blur", this.clearKeys);
		new ResizeObserver(() => this.resize()).observe(host);
		this.resize();
		this.syncGizmo();
		this.tick = this.tick.bind(this);
		this.raf = requestAnimationFrame(this.tick);
		this.expose();
		this.emit();
	}
	mode = "orbit";
	getSnapshot() {
		return this.snapshot;
	}
	subscribe(fn) {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}
	emit() {
		this.snapshot = {
			v: this.snapshot.v + 1,
			state: this.state
		};
		for (const fn of this.listeners) fn();
		this.schedulePreview();
	}
	touch() {
		this.syncGizmo();
		this.emit();
	}
	pushHistory() {
		this.undoStack.push(JSON.stringify(this.historyBlob()));
		if (this.undoStack.length > 50) this.undoStack.shift();
		this.redoStack = [];
	}
	undo() {
		const prev = this.undoStack.pop();
		if (!prev) return;
		this.redoStack.push(JSON.stringify(this.historyBlob()));
		this.restore(prev);
	}
	redo() {
		const next = this.redoStack.pop();
		if (!next) return;
		this.undoStack.push(JSON.stringify(this.historyBlob()));
		this.restore(next);
	}
	historyBlob() {
		return {
			figures: this.state.figures,
			selection: this.state.selection,
			jointLimits: this.state.jointLimits
		};
	}
	restore(json) {
		const data = JSON.parse(json);
		this.state.figures = data.figures;
		this.state.selection = data.selection;
		this.state.jointLimits = data.jointLimits;
		const live = new Map(this.views.map((v) => [v.data.id, v]));
		const next = [];
		for (const fig of this.state.figures) {
			let view = live.get(fig.id);
			if (!view) view = this.attachView(fig, false);
			else {
				view.data = fig;
				view.rebuild(true);
			}
			live.delete(fig.id);
			next.push(view);
		}
		for (const stale of live.values()) stale.dispose();
		this.views = next;
		this.nextId = Math.max(this.nextId, ...this.state.figures.map((f) => Number(f.id.slice(1)) || 0)) + 1;
		this.touch();
	}
	attachView(fig, capture) {
		const view = new FigureView(fig);
		this.scene.add(view.group);
		this.views.push(view);
		view.updateSkeleton(this.state.jointLimits, null);
		if (capture) view.captureTargets();
		return view;
	}
	selected() {
		return this.views.find((v) => v.data.id === this.state.selection.figureId);
	}
	addFigure(presetId = "adult-f") {
		if (this.state.figures.length >= 4) return;
		this.pushHistory();
		const fig = makeFigure(this.nextId++, presetId);
		fig.position.x = this.state.figures.length * .9;
		this.state.figures.push(fig);
		this.state.selection = {
			figureId: fig.id,
			bone: null
		};
		this.attachView(fig, true);
		this.touch();
	}
	deleteSelected() {
		const id = this.state.selection.figureId;
		if (!id) return;
		this.pushHistory();
		this.state.figures = this.state.figures.filter((f) => f.id !== id);
		this.views.find((v) => v.data.id === id)?.dispose();
		this.views = this.views.filter((v) => v.data.id !== id);
		this.state.selection = {
			figureId: this.state.figures[0]?.id ?? null,
			bone: null
		};
		this.touch();
	}
	duplicateSelected() {
		const src = this.selected();
		if (!src || this.state.figures.length >= 4) return;
		this.pushHistory();
		const fig = clone(src.data);
		fig.id = `f${this.nextId++}`;
		fig.name = `${src.data.name} copy`;
		fig.position = {
			...src.data.position,
			x: src.data.position.x + .55
		};
		fig.color = [
			"#3ecfb2",
			"#e0a045",
			"#d4654f",
			"#7aa2d4"
		][this.state.figures.length % 4];
		this.state.figures.push(fig);
		this.state.selection = {
			figureId: fig.id,
			bone: null
		};
		this.attachView(fig, false);
		this.touch();
	}
	selectFigure(id) {
		this.state.selection = {
			figureId: id,
			bone: null
		};
		this.touch();
	}
	rename(id, name) {
		const fig = this.state.figures.find((f) => f.id === id);
		if (!fig) return;
		fig.name = name.slice(0, 40);
		this.emit();
	}
	setVisible(id, visible) {
		const fig = this.state.figures.find((f) => f.id === id);
		if (!fig) return;
		this.pushHistory();
		fig.visible = visible;
		this.emit();
	}
	setParams(id, patch) {
		const fig = this.state.figures.find((f) => f.id === id);
		if (!fig) return;
		fig.params = clampParams({
			...fig.params,
			...patch
		});
		this.views.find((v) => v.data.id === id)?.rebuild();
		this.emit();
	}
	applyBodyPreset(id, presetId) {
		const preset = BODY_PRESETS.find((p) => p.id === presetId);
		const fig = this.state.figures.find((f) => f.id === id);
		if (!preset || !fig) return;
		this.pushHistory();
		fig.params = { ...preset.params };
		this.views.find((v) => v.data.id === id)?.rebuild(true);
		this.touch();
	}
	applyPosePreset(poseId) {
		const view = this.selected();
		const pose = poseById(poseId);
		if (!view || !pose) return;
		this.pushHistory();
		view.data.pose = clone(pose);
		view.data.pelvisOffset = {
			x: 0,
			y: 0,
			z: 0
		};
		view.updateSkeleton(false, null);
		view.captureTargets();
		this.touch();
	}
	applyHand(side, preset) {
		const view = this.selected();
		if (!view) return;
		this.pushHistory();
		if (side !== "R") writeHand(view.data.pose, "L", preset);
		if (side !== "L") writeHand(view.data.pose, "R", preset);
		this.touch();
	}
	mirror(direction) {
		const view = this.selected();
		if (!view) return;
		this.pushHistory();
		view.data.pose = mirrorPose(view.data.pose, direction);
		view.updateSkeleton(this.state.jointLimits, null);
		view.captureTargets();
		this.touch();
	}
	setIk(on) {
		const view = this.selected();
		if (!view) return;
		this.pushHistory();
		if (on) {
			view.updateSkeleton(this.state.jointLimits, null);
			view.captureTargets();
		} else {
			view.updateSkeleton(this.state.jointLimits, null);
			view.bakePose(this.state.jointLimits);
		}
		view.data.ik = on;
		this.touch();
	}
	setJointLimits(on) {
		this.state.jointLimits = on;
		this.emit();
	}
	setShowJoints(on) {
		this.state.showJoints = on;
		this.emit();
	}
	setShowGrid(on) {
		this.state.showGrid = on;
		this.grid.visible = on;
		this.emit();
	}
	setTool(tool) {
		this.state.tool = tool;
		this.touch();
	}
	setExport(patch) {
		const next = {
			...this.state.export,
			...patch
		};
		if (patch.width !== void 0 || patch.height !== void 0 || patch.preset === "custom") {
			const snapped = snapResolution(next.width, next.height);
			next.width = snapped.width;
			next.height = snapped.height;
		}
		this.state.export = next;
		this.emit();
	}
	snapFeet() {
		const view = this.selected();
		if (!view) return;
		this.pushHistory();
		view.updateSkeleton(this.state.jointLimits, null);
		const y = view.soleY();
		if (Number.isFinite(y)) view.data.position.y -= y;
		this.touch();
	}
	getMode() {
		return this.mode;
	}
	getFov() {
		return this.camera.fov;
	}
	setScale(scale) {
		const view = this.selected();
		if (!view) return;
		view.data.scale = Math.min(1.8, Math.max(.4, scale));
		this.emit();
	}
	setCameraMode(mode) {
		if (mode === "fly" && this.mode !== "fly") this.syncFlyFromCamera();
		if (mode === "orbit" && this.mode !== "orbit") {
			const dir = new Vector3();
			this.camera.getWorldDirection(dir);
			this.orbit.target.copy(this.camera.position).addScaledVector(dir, 2.2);
		}
		this.mode = mode;
		this.orbit.enabled = mode === "orbit";
		if (mode !== "fly" && document.pointerLockElement) document.exitPointerLock();
		this.hint.textContent = mode === "fly" ? "Fly · click to look · WASD move · A left D right · Q down E up · Shift faster · Esc release" : "Orbit · left drag look · right drag pan · scroll zoom";
		this.syncGizmo();
		this.emit();
	}
	setFov(fov) {
		this.camera.fov = Math.min(100, Math.max(20, fov));
		this.camera.updateProjectionMatrix();
		this.cameraDirty = true;
		this.emit();
	}
	frameAll() {
		this.frame(this.views.filter((v) => v.data.visible));
	}
	frameSelected() {
		const v = this.selected();
		this.frame(v ? [v] : this.views);
	}
	frame(list) {
		if (!list.length) return;
		const boxMin = new Vector3(Infinity, Infinity, Infinity);
		const boxMax = new Vector3(-Infinity, -Infinity, -Infinity);
		const p = new Vector3();
		for (const view of list) for (const bone of view.bones.values()) {
			bone.getWorldPosition(p);
			boxMin.min(p);
			boxMax.max(p);
		}
		const center = boxMin.clone().add(boxMax).multiplyScalar(.5);
		const size = boxMax.clone().sub(boxMin);
		const radius = .5 * Math.max(size.x, size.y, size.z, .4);
		const fov = this.camera.fov * Math.PI / 180;
		const dist = Math.min(24, Math.max(.8, radius / Math.sin(fov / 2)));
		if (this.mode === "orbit") {
			const dir = this.camera.position.clone().sub(this.orbit.target);
			if (dir.lengthSq() < 1e-4) dir.set(.4, .25, 1);
			dir.normalize();
			this.orbit.target.copy(center);
			this.camera.position.copy(center).addScaledVector(dir, dist * 1.15);
			this.orbit.update();
		} else {
			const look = new Vector3();
			this.camera.getWorldDirection(look);
			this.camera.position.copy(center).addScaledVector(look, -dist);
			this.syncFlyFromCamera();
		}
		this.cameraDirty = true;
	}
	resetCamera() {
		this.mode = "orbit";
		this.orbit.enabled = true;
		this.camera.position.set(1.55, 1.22, 3.15);
		this.camera.fov = 50;
		this.camera.updateProjectionMatrix();
		this.orbit.target.set(0, .95, 0);
		this.orbit.update();
		this.syncFlyFromCamera();
		this.hint.textContent = "Orbit · left drag look · right drag pan · scroll zoom";
		this.emit();
	}
	syncFlyFromCamera() {
		const dir = new Vector3();
		this.camera.getWorldDirection(dir);
		this.fly.pitch = Math.asin(Math.min(1, Math.max(-1, dir.y)));
		this.fly.yaw = Math.atan2(-dir.x, -dir.z);
	}
	resize() {
		const w = Math.max(1, this.host.clientWidth);
		const h = Math.max(1, this.host.clientHeight);
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.overlay.width = w;
		this.overlay.height = h;
		this.updateCrop();
	}
	updateCrop() {
		const w = this.host.clientWidth;
		const h = this.host.clientHeight;
		const fit = exportCameraFit(w, h, this.state.export.width, this.state.export.height, this.camera.fov);
		this.crop.style.left = `${fit.x}px`;
		this.crop.style.top = `${fit.y}px`;
		this.crop.style.width = `${fit.w}px`;
		this.crop.style.height = `${fit.h}px`;
	}
	tick(now) {
		if (this.disposed) return;
		const dt = Math.min(.05, (now - this.last) / 1e3);
		this.last = now;
		if (this.mode === "fly") this.stepFly(dt);
		else this.fly.speed = 0;
		if (this.mode === "orbit") this.orbit.update();
		const skip = this.skipBone;
		for (const view of this.views) {
			view.rebuild();
			view.updateSkeleton(this.state.jointLimits, view.data.id === this.state.selection.figureId ? skip : null);
			const selected = view.data.id === this.state.selection.figureId;
			view.setMarkerStyle(selected ? this.state.selection.bone : null, this.hoverBone, this.state.showJoints);
			view.mesh.visible = view.data.visible;
		}
		this.grid.visible = this.state.showGrid;
		this.updateCrop();
		this.drawViewportOverlay();
		this.renderer.render(this.scene, this.camera);
		if (this.cameraDirty) {
			this.cameraDirty = false;
			this.schedulePreview();
		}
		this.raf = requestAnimationFrame(this.tick);
	}
	stepFly(dt) {
		const speed = (this.keys.has("ShiftLeft") || this.keys.has("ShiftRight") ? 4.8 : 1.9) * dt;
		const yaw = this.fly.yaw;
		const pitch = this.fly.pitch;
		const forward = new Vector3(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
		const right = new Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
		const before = this.camera.position.clone();
		if (this.keys.has("KeyW")) this.camera.position.addScaledVector(forward, speed);
		if (this.keys.has("KeyS")) this.camera.position.addScaledVector(forward, -speed);
		if (this.keys.has("KeyD")) this.camera.position.addScaledVector(right, speed);
		if (this.keys.has("KeyA")) this.camera.position.addScaledVector(right, -speed);
		if (this.keys.has("KeyE")) this.camera.position.y += speed;
		if (this.keys.has("KeyQ")) this.camera.position.y -= speed;
		const look = this.camera.position.clone().add(forward);
		this.camera.up.set(0, 1, 0);
		this.camera.lookAt(look);
		const moved = this.camera.position.distanceTo(before);
		this.fly.speed = dt > 0 ? moved / dt : 0;
		if (moved > 0) this.cameraDirty = true;
	}
	hoverBone = null;
	down = {
		x: 0,
		y: 0
	};
	onPointerDown = (e) => {
		this.down.x = e.clientX;
		this.down.y = e.clientY;
	};
	onPointerMove = (e) => {
		if (document.pointerLockElement === this.renderer.domElement && this.mode === "fly") {
			this.fly.yaw -= e.movementX * .0022;
			this.fly.pitch -= e.movementY * .0022;
			this.fly.pitch = Math.min(1.35, Math.max(-1.35, this.fly.pitch));
			return;
		}
		this.pointerFrom(e);
		this.raycaster.setFromCamera(this.pointer, this.camera);
		const markers = this.views.flatMap((v) => v.data.visible ? [...v.markers.values()] : []);
		const hit = this.raycaster.intersectObjects(markers, false)[0];
		this.hoverBone = hit ? hit.object.userData.bone : null;
	};
	onPointerUp = (e) => {
		if (this.suppressPick) {
			this.suppressPick = false;
			return;
		}
		const dx = e.clientX - this.down.x;
		const dy = e.clientY - this.down.y;
		if (dx * dx + dy * dy > 16) return;
		this.pointerFrom(e);
		this.raycaster.setFromCamera(this.pointer, this.camera);
		const markers = this.views.flatMap((v) => v.data.visible && this.state.showJoints ? [...v.markers.values()] : []);
		const hit = this.raycaster.intersectObjects(markers, false)[0];
		if (hit) {
			this.state.selection = {
				figureId: hit.object.userData.figureId,
				bone: hit.object.userData.bone
			};
			this.touch();
			return;
		}
		const meshes = this.views.filter((v) => v.data.visible).map((v) => v.mesh);
		const body = this.raycaster.intersectObjects(meshes, false)[0];
		if (body) {
			const view = this.views.find((v) => v.mesh === body.object);
			if (view) this.state.selection = {
				figureId: view.data.id,
				bone: null
			};
			this.touch();
			return;
		}
		this.state.selection = {
			figureId: this.state.selection.figureId,
			bone: null
		};
		this.touch();
	};
	pointerFrom(e) {
		const rect = this.renderer.domElement.getBoundingClientRect();
		this.pointer.x = (e.clientX - rect.left) / rect.width * 2 - 1;
		this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
	}
	typingTarget(target) {
		return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
	}
	onKeyDown = (e) => {
		if (this.typingTarget(e.target)) return;
		this.keys.add(e.code);
		const key = e.key.toLowerCase();
		if (e.key === "?" || e.shiftKey && e.key === "/") {
			this.onHelp?.();
			return;
		}
		if ((e.ctrlKey || e.metaKey) && key === "z") {
			e.preventDefault();
			if (e.shiftKey) this.redo();
			else this.undo();
			return;
		}
		if ((e.ctrlKey || e.metaKey) && key === "y") {
			e.preventDefault();
			this.redo();
			return;
		}
		if (e.key === "Delete") {
			this.deleteSelected();
			return;
		}
		if (e.key === "Tab") {
			e.preventDefault();
			this.cycle(e.shiftKey ? -1 : 1);
			return;
		}
		if (this.mode === "fly" && (key === "e" || key === "q")) return;
		if (key === "g") this.setTool("translate");
		else if (key === "r") this.setTool("rotate");
		else if (key === "f") this.frameSelected();
		else if (key === "c") this.setCameraMode(this.mode === "orbit" ? "fly" : "orbit");
		else if (key === "e") this.exportAll();
	};
	onKeyUp = (e) => {
		this.keys.delete(e.code);
	};
	clearKeys = () => {
		this.keys.clear();
	};
	onLock = () => {
		if (document.pointerLockElement !== this.renderer.domElement) this.keys.clear();
	};
	cycle(dir) {
		const ids = this.state.figures.map((f) => f.id);
		if (!ids.length) return;
		const next = ids[(Math.max(0, ids.indexOf(this.state.selection.figureId ?? "")) + dir + ids.length) % ids.length];
		this.state.selection = {
			figureId: next,
			bone: null
		};
		this.touch();
	}
	onHelp = null;
	syncGizmo() {
		const view = this.selected();
		this.gizmo.enabled = this.mode === "orbit";
		if (!view || this.mode === "fly") {
			this.gizmo.detach();
			return;
		}
		const bone = this.state.selection.bone;
		const tool = this.state.tool;
		const ikKey = bone ? IK_BONE[bone] : void 0;
		const driven = !!view.data.ik && !!bone && DRIVEN.has(bone);
		if (!bone || tool === "scale") {
			this.gizmo.attach(view.group);
			this.gizmo.setMode(tool === "rotate" ? "rotate" : tool === "scale" ? "scale" : "translate");
			this.gizmo.space = "world";
			const rot = tool === "rotate";
			this.gizmo.showX = !rot;
			this.gizmo.showY = true;
			this.gizmo.showZ = !rot;
			return;
		}
		if (view.data.ik && ikKey && tool === "translate") {
			const helper = view.targets.get(ikKey);
			if (!helper) return;
			this.gizmo.attach(helper);
			this.gizmo.setMode("translate");
			this.gizmo.space = "local";
			this.gizmo.showX = this.gizmo.showY = this.gizmo.showZ = true;
			return;
		}
		if (driven || tool !== "rotate") {
			this.gizmo.detach();
			return;
		}
		const b = view.bones.get(bone);
		if (!b) return;
		this.gizmo.attach(b);
		this.gizmo.setMode("rotate");
		this.gizmo.space = "local";
		this.gizmo.showX = this.gizmo.showY = this.gizmo.showZ = true;
	}
	onGizmo() {
		const view = this.selected();
		if (!view || !this.gizmo.object) return;
		const obj = this.gizmo.object;
		if (obj === view.group) {
			view.data.position = {
				x: obj.position.x,
				y: obj.position.y,
				z: obj.position.z
			};
			view.data.rotationY = obj.rotation.y * 180 / Math.PI;
			const s = (obj.scale.x + obj.scale.y + obj.scale.z) / 3;
			obj.scale.setScalar(s);
			view.data.scale = s;
			this.skipBone = null;
			view.holdTarget = null;
			return;
		}
		if (obj instanceof Object && view.targets.has(obj.name)) {
			view.holdTarget = obj.name;
			if (obj.name === "pelvis") {
				const hips = view.segments.find((s) => s.name === "hips");
				if (hips) view.data.pelvisOffset = {
					x: obj.position.x - hips.head.x,
					y: obj.position.y - hips.head.y,
					z: obj.position.z - hips.head.z
				};
			} else {
				const key = obj.name;
				view.data.ikTargets[key] = {
					x: obj.position.x,
					y: obj.position.y,
					z: obj.position.z
				};
			}
			return;
		}
		const boneName = obj.name;
		if (view.bones.has(boneName)) {
			this.skipBone = boneName;
			const euler = view.readEuler(boneName);
			const stoopOnly = composedEuler(boneName, {}, view.data.params, false);
			view.data.pose[boneName] = {
				x: euler.x - stoopOnly.x,
				y: euler.y - stoopOnly.y,
				z: euler.z - stoopOnly.z
			};
		}
	}
	finishDrag() {
		const view = this.selected();
		this.skipBone = null;
		if (view) view.holdTarget = null;
		this.suppressPick = true;
		this.touch();
	}
	exportCamera(width, height) {
		const fit = exportCameraFit(Math.max(1, this.host.clientWidth), Math.max(1, this.host.clientHeight), width, height, this.camera.fov);
		const cam = this.camera.clone();
		cam.fov = fit.fov;
		cam.aspect = width / height;
		cam.updateProjectionMatrix();
		cam.updateMatrixWorld(true);
		return cam;
	}
	people(cam, width, height, only) {
		const out = [];
		for (const view of this.views) {
			if (!view.data.visible) continue;
			if (only && view.data.id !== only) continue;
			out.push(view.samplePose(cam, width, height, this.state.export.hideOccluded, this.raycaster));
		}
		return out;
	}
	poseCanvas(width, height, only, clear = true) {
		const cam = this.exportCamera(width, height);
		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return canvas;
		drawOpenPose(ctx, this.people(cam, width, height, only), width, height, {
			handsFace: this.state.export.includeHandsFace,
			clear
		});
		return canvas;
	}
	updateWarning(people, height) {
		const cover = bodyCoverage(people, height);
		const text = people.length > 0 && cover < .18 ? "A figure spans under 18% of the frame. ControlNet is more reliable when the full body is larger." : "";
		if (text !== this.state.warning) {
			this.state.warning = text;
			this.snapshot = {
				v: this.snapshot.v + 1,
				state: this.state
			};
			for (const fn of this.listeners) fn();
		}
	}
	async renderGL(width, height, clear, draw) {
		const cam = this.exportCamera(width, height);
		const target = new WebGLRenderTarget(width, height, { depthBuffer: true });
		target.texture.colorSpace = LinearSRGBColorSpace;
		const prev = this.scene.background;
		this.scene.background = pngColor(clear);
		for (const h of this.helpers) h.visible = false;
		for (const v of this.views) for (const m of v.markers.values()) m.visible = false;
		this.gizmo.getHelper().visible = false;
		this.exporter.setSize(width, height, false);
		this.exporter.setRenderTarget(target);
		this.exporter.setClearColor(pngColor(clear), 1);
		draw(cam);
		this.exporter.render(this.scene, cam);
		const buf = new Uint8Array(width * height * 4);
		await this.exporter.readRenderTargetPixelsAsync(target, 0, 0, width, height, buf);
		this.exporter.setRenderTarget(null);
		target.dispose();
		this.scene.background = prev;
		for (const h of this.helpers) h.visible = true;
		this.grid.visible = this.state.showGrid;
		this.gizmo.getHelper().visible = true;
		return rgbaToRgb(buf, width, height, true);
	}
	async glPng(width, height, clear, prepare) {
		const rgb = await this.renderGL(width, height, clear, () => prepare());
		for (const v of this.views) v.mesh.material = v.beauty;
		return pngBlob(width, height, rgb);
	}
	async exportPng(kind, figureIndex = 0) {
		const { width, height } = this.state.export;
		if (kind === "openpose" || kind === "openpose-figure") {
			const only = kind === "openpose-figure" ? this.state.figures[figureIndex]?.id : void 0;
			const canvas = this.poseCanvas(width, height, only, true);
			const people = this.people(this.exportCamera(width, height), width, height, only);
			this.updateWarning(people, height);
			return pngBlob(width, height, canvasToRgb(canvas));
		}
		if (kind === "wire") return this.wireBlobReal(width, height);
		if (kind === "depth") return this.depthBlob(width, height);
		if (kind === "normal") return this.glPng(width, height, "#8080ff", () => {
			for (const v of this.views) {
				v.mesh.material = v.normal;
				v.mesh.visible = v.data.visible;
			}
		});
		if (kind === "mask" || kind === "mask-figure") {
			const only = kind === "mask-figure" ? this.state.figures[figureIndex] : void 0;
			return this.glPng(width, height, "#000000", () => {
				for (const v of this.views) {
					const on = v.data.visible && (!only || v.data.id === only.id);
					v.mesh.visible = on;
					v.mask.color.copy(pngColor(only ? "#ffffff" : v.data.color));
					v.mesh.material = v.mask;
				}
			});
		}
		throw new Error(`unknown export ${kind}`);
	}
	async wireBlobReal(width, height) {
		const exp = this.state.export;
		const clear = exp.wireInvert ? "#ffffff" : "#000000";
		const cam = this.exportCamera(width, height);
		const target = new WebGLRenderTarget(width, height, { depthBuffer: true });
		target.texture.colorSpace = LinearSRGBColorSpace;
		const prev = this.scene.background;
		this.scene.background = pngColor(clear);
		for (const h of this.helpers) h.visible = false;
		for (const v of this.views) for (const m of v.markers.values()) m.visible = false;
		this.gizmo.getHelper().visible = false;
		this.exporter.setSize(width, height, false);
		this.exporter.setRenderTarget(target);
		this.exporter.setClearColor(pngColor(clear), 1);
		this.exporter.autoClear = true;
		this.exporter.clear(true, true, true);
		if (!exp.wireXray) {
			const depthOnly = new MeshStandardMaterial({ colorWrite: false });
			for (const v of this.views) {
				v.mesh.visible = v.data.visible;
				v.mesh.material = depthOnly;
			}
			this.exporter.render(this.scene, cam);
			depthOnly.dispose();
			this.exporter.autoClear = false;
		}
		for (const v of this.views) {
			v.mesh.visible = v.data.visible;
			const color = pngColor(exp.wireColored ? v.data.color : exp.wireInvert ? "#000000" : "#ffffff");
			v.wire.uniforms.uColor.value = color;
			v.wire.uniforms.uThickness.value = exp.wireThickness;
			v.wire.uniforms.uAA.value = exp.wireAA ? 1 : 0;
			v.wire.depthTest = !exp.wireXray;
			v.wire.depthWrite = false;
			v.mesh.material = v.wire;
		}
		this.exporter.render(this.scene, cam);
		this.exporter.autoClear = true;
		const buf = new Uint8Array(width * height * 4);
		await this.exporter.readRenderTargetPixelsAsync(target, 0, 0, width, height, buf);
		this.exporter.setRenderTarget(null);
		target.dispose();
		this.scene.background = prev;
		for (const h of this.helpers) h.visible = true;
		this.grid.visible = this.state.showGrid;
		this.gizmo.getHelper().visible = true;
		for (const v of this.views) {
			v.mesh.material = v.beauty;
			v.mesh.visible = v.data.visible;
		}
		return pngBlob(width, height, rgbaToRgb(buf, width, height, true));
	}
	async depthBlob(width, height) {
		const cam = this.exportCamera(width, height);
		let near = cam.near;
		let far = Math.min(cam.far, 12);
		if (this.state.export.depthAuto) {
			near = Infinity;
			far = .05;
			for (const v of this.views) {
				if (!v.data.visible) continue;
				for (const bone of v.bones.values()) {
					bone.getWorldPosition(this.depthScratch);
					this.depthScratch.applyMatrix4(cam.matrixWorldInverse);
					const z = -this.depthScratch.z;
					if (z > 0) {
						near = Math.min(near, z);
						far = Math.max(far, z);
					}
				}
			}
			if (!Number.isFinite(near)) {
				near = .2;
				far = 8;
			}
			near = Math.max(.05, near * .85);
			far = Math.max(near + .3, far * 1.08);
		}
		this.depthMat.uniforms.uNear.value = near;
		this.depthMat.uniforms.uFar.value = far;
		this.depthMat.colorWrite = true;
		return this.glPng(width, height, "#000000", () => {
			for (const v of this.views) {
				v.mesh.material = this.depthMat;
				v.mesh.visible = v.data.visible;
			}
		});
	}
	async exportJson() {
		const { width, height } = this.state.export;
		const cam = this.exportCamera(width, height);
		const people = this.people(cam, width, height);
		this.updateWarning(people, height);
		const json = openPoseJson(people, width, height, this.state.export.includeHandsFace);
		return new Blob([json], { type: "application/json" });
	}
	async exportAll() {
		const { width, height } = this.state.export;
		const items = [];
		const push = async (name, blob) => {
			items.push({
				name,
				data: new Uint8Array(await blob.arrayBuffer())
			});
		};
		await push("openpose.png", await this.exportPng("openpose"));
		await push("wireframe.png", await this.wireBlobReal(width, height));
		await push("depth.png", await this.depthBlob(width, height));
		await push("normal.png", await this.exportPng("normal"));
		await push("mask_combined.png", await this.exportPng("mask"));
		await push("openpose.json", await this.exportJson());
		for (let i = 0; i < this.state.figures.length; i++) {
			if (!this.state.figures[i].visible) continue;
			const n = i + 1;
			await push(`mask_figure${n}.png`, await this.exportPng("mask-figure", i));
			await push(`openpose_figure${n}.png`, await this.exportPng("openpose-figure", i));
		}
		const settings = {
			version: 1,
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			resolution: {
				width,
				height
			},
			export: this.state.export,
			camera: this.cameraBlob(),
			figures: this.state.figures
		};
		items.push({
			name: "settings.json",
			data: new TextEncoder().encode(JSON.stringify(settings, null, 2))
		});
		downloadBlob(zipBlob(items), `posewright-${stamp()}.zip`);
	}
	async download(kind) {
		downloadBlob(kind === "wire" ? await this.wireBlobReal(this.state.export.width, this.state.export.height) : await this.exportPng(kind), `${kind}-${stamp()}.png`);
	}
	async downloadJson() {
		downloadBlob(await this.exportJson(), `openpose-${stamp()}.json`);
	}
	saveScene() {
		const payload = {
			version: 1,
			state: this.state,
			camera: this.cameraBlob()
		};
		downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `posewright-scene-${stamp()}.json`);
	}
	async loadScene(file) {
		const data = JSON.parse(await file.text());
		if (!data?.state?.figures) throw new Error("That file is not a Posewright scene.");
		this.pushHistory();
		for (const v of this.views) v.dispose();
		this.views = [];
		this.state.figures = data.state.figures.slice(0, 4);
		this.state.selection = data.state.selection ?? {
			figureId: this.state.figures[0]?.id ?? null,
			bone: null
		};
		this.state.jointLimits = data.state.jointLimits ?? true;
		this.state.showJoints = data.state.showJoints ?? true;
		this.state.showGrid = data.state.showGrid ?? true;
		this.state.export = {
			...this.state.export,
			...data.state.export
		};
		this.state.tool = data.state.tool ?? "rotate";
		for (const fig of this.state.figures) this.attachView(fig, false);
		if (data.camera) this.applyCamera(data.camera);
		this.touch();
	}
	savePose() {
		const view = this.selected();
		if (!view) return;
		downloadBlob(new Blob([JSON.stringify({
			version: 1,
			pose: view.data.pose,
			pelvisOffset: view.data.pelvisOffset
		}, null, 2)], { type: "application/json" }), `pose-${stamp()}.json`);
	}
	async loadPose(file) {
		const view = this.selected();
		if (!view) return;
		const data = JSON.parse(await file.text());
		if (!data.pose) throw new Error("That file is not a pose.");
		this.pushHistory();
		view.data.pose = data.pose;
		if (data.pelvisOffset) view.data.pelvisOffset = data.pelvisOffset;
		view.updateSkeleton(this.state.jointLimits, null);
		view.captureTargets();
		this.touch();
	}
	cameraBlob() {
		return {
			mode: this.mode,
			fov: this.camera.fov,
			position: this.camera.position.toArray(),
			target: this.orbit.target.toArray(),
			yaw: this.fly.yaw,
			pitch: this.fly.pitch
		};
	}
	applyCamera(cam) {
		this.camera.fov = cam.fov;
		this.camera.position.fromArray(cam.position);
		this.orbit.target.fromArray(cam.target);
		this.camera.updateProjectionMatrix();
		this.orbit.update();
		this.fly.yaw = cam.yaw;
		this.fly.pitch = cam.pitch;
		this.setCameraMode(cam.mode);
	}
	setPreviewCanvases(canvases) {
		this.preview = canvases;
		this.schedulePreview();
	}
	schedulePreview() {
		window.clearTimeout(this.previewTimer);
		this.previewTimer = window.setTimeout(() => void this.renderPreview(), 180);
	}
	async renderPreview() {
		try {
			await this.renderPreviewInner();
		} catch (err) {
			console.error("preview failed", err);
		}
	}
	async renderPreviewInner() {
		const pose = this.preview.pose;
		if (!pose) return;
		const aspect = this.state.export.width / this.state.export.height;
		const w = 256;
		const h = Math.max(64, Math.round(w / aspect / 8) * 8);
		const ww = Math.round(w / 8) * 8;
		const drawInto = (el, src) => {
			if (!el) return;
			el.width = src.width;
			el.height = src.height;
			el.getContext("2d")?.drawImage(src, 0, 0);
		};
		const poseCanvas = this.poseCanvas(ww, h);
		drawInto(pose, poseCanvas);
		const people = this.people(this.exportCamera(ww, h), ww, h);
		this.updateWarning(people, h);
		const paint = async (el, blob) => {
			if (!el) return;
			const bmp = await createImageBitmap(blob);
			el.width = bmp.width;
			el.height = bmp.height;
			el.getContext("2d")?.drawImage(bmp, 0, 0);
			bmp.close();
		};
		await paint(this.preview.wire, await this.wireBlobReal(ww, h));
		await paint(this.preview.depth, await this.depthBlob(ww, h));
		await paint(this.preview.normal, await this.smallNormal(ww, h));
		await paint(this.preview.mask, await this.smallMask(ww, h));
		if (this.preview.align) {
			const align = document.createElement("canvas");
			align.width = ww;
			align.height = h;
			const ctx = align.getContext("2d");
			if (ctx && this.preview.wire) ctx.drawImage(this.preview.wire, 0, 0);
			const ctx2 = poseCanvas.getContext("2d");
			if (ctx && ctx2) {
				const img = ctx2.getImageData(0, 0, ww, h);
				const over = ctx.getImageData(0, 0, ww, h);
				for (let i = 0; i < img.data.length; i += 4) if (img.data[i] + img.data[i + 1] + img.data[i + 2] > 12) {
					over.data[i] = img.data[i];
					over.data[i + 1] = img.data[i + 1];
					over.data[i + 2] = img.data[i + 2];
					over.data[i + 3] = 255;
				}
				ctx.putImageData(over, 0, 0);
			}
			drawInto(this.preview.align, align);
		}
	}
	async smallMask(w, h) {
		return this.glPng(w, h, "#000000", () => {
			for (const v of this.views) {
				v.mesh.visible = v.data.visible;
				v.mask.color.copy(pngColor(v.data.color));
				v.mesh.material = v.mask;
			}
		});
	}
	async smallNormal(w, h) {
		return this.glPng(w, h, "#8080ff", () => {
			for (const v of this.views) {
				v.mesh.material = v.normal;
				v.mesh.visible = v.data.visible;
			}
		});
	}
	drawViewportOverlay() {
		const ctx = this.overlay.getContext("2d");
		if (!ctx) return;
		const w = this.overlay.width;
		const h = this.overlay.height;
		ctx.clearRect(0, 0, w, h);
		if (this.state.export.overlay === "off") return;
		this.camera.updateMatrixWorld();
		drawOpenPose(ctx, this.people(this.camera, w, h), w, h, {
			handsFace: this.state.export.includeHandsFace,
			clear: false
		});
	}
	expose() {
		const engine = this;
		window.__poser = {
			ready: true,
			addFigure: (preset) => engine.addFigure(preset),
			setCameraMode: (mode) => engine.setCameraMode(mode),
			frameAll: () => engine.frameAll(),
			figureCount: () => engine.state.figures.length
		};
		window.__controlsTest = {
			getYaw: () => engine.fly.yaw,
			getSpeed: () => engine.fly.speed,
			getPos: () => ({
				x: engine.camera.position.x,
				y: engine.camera.position.y,
				z: engine.camera.position.z
			}),
			setKeys: (codes) => {
				engine.keys = new Set(codes);
			}
		};
	}
	dispose() {
		this.disposed = true;
		cancelAnimationFrame(this.raf);
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
		this.renderer.dispose();
		this.exporter.dispose();
		this.orbit.dispose();
		this.gizmo.dispose();
	}
};
var HANDS = [
	{
		id: "open",
		label: "Open"
	},
	{
		id: "relaxed",
		label: "Relaxed"
	},
	{
		id: "fist",
		label: "Fist"
	},
	{
		id: "point",
		label: "Point"
	},
	{
		id: "grip",
		label: "Grip"
	}
];
function PoserApp() {
	const hostRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const [engine, setEngine] = (0, import_react.useState)(null);
	const [help, setHelp] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("stage");
	const previews = (0, import_react.useRef)({});
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host) return;
		const eng = new PoserEngine(host);
		eng.onHelp = () => setHelp((v) => !v);
		engineRef.current = eng;
		setEngine(eng);
		return () => {
			eng.dispose();
			engineRef.current = null;
		};
	}, []);
	const state = (0, import_react.useSyncExternalStore)((cb) => engine?.subscribe(cb) ?? (() => {}), () => engine?.getSnapshot() ?? null, () => null)?.state;
	(0, import_react.useEffect)(() => {
		if (!engine) return;
		const els = previews.current;
		engine.setPreviewCanvases({
			pose: els.pose ?? void 0,
			wire: els.wire ?? void 0,
			depth: els.depth ?? void 0,
			normal: els.normal ?? void 0,
			mask: els.mask ?? void 0,
			align: els.align ?? void 0
		});
	}, [engine, tab]);
	const selected = state?.figures.find((f) => f.id === state.selection.figureId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col lg:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: `${panelClass(tab === "figure")} lg:flex lg:w-80 lg:flex-col lg:border-r`,
						children: engine && state && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FigurePanel, {
							engine,
							figures: state.figures,
							selected,
							atCap: state.figures.length >= 4
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `${tab === "stage" ? "flex" : "hidden"} relative min-h-[46vh] flex-1 flex-col lg:flex`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: hostRef,
							className: "relative min-h-0 w-full flex-1"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: `${tab === "pose" || tab === "export" ? "flex" : "hidden"} min-h-0 flex-col lg:flex lg:w-96 lg:border-l`,
						children: [engine && state && selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `${tab === "pose" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PosePanel, {
								engine,
								figure: selected,
								limits: state.jointLimits,
								tool: state.tool
							})
						}), engine && state && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `${tab === "export" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:max-h-[46%] lg:flex`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportPanel, {
								engine,
								warning: state.warning,
								settings: state.export,
								previews,
								count: state.figures.length
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex border-t border-line lg:hidden",
				children: [
					["stage", "Stage"],
					["figure", "Figure"],
					["pose", "Pose"],
					["export", "Export"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: `Show the ${label.toLowerCase()} panel`,
					className: `min-h-11 flex-1 text-sm ${tab === id ? "bg-surface-2 text-accent" : "text-muted"}`,
					onClick: () => setTab(id),
					children: label
				}, id))
			}),
			engine && state && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex items-center gap-2 overflow-x-auto border-t border-line bg-surface px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Orbit around a target (C)",
						className: chip(engine.getMode() === "orbit"),
						onClick: () => engine.setCameraMode("orbit"),
						children: "Orbit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Fly with WASD. A strafes left, D strafes right, Q down, E up (C)",
						className: chip(engine.getMode() === "fly"),
						onClick: () => engine.setCameraMode("fly"),
						children: "Fly"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-xs text-muted",
						title: "Vertical field of view, 20 to 100 degrees",
						children: ["FOV", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 20,
							max: 100,
							value: Math.round(engine.getFov()),
							onChange: (e) => engine.setFov(Number(e.target.value)),
							className: "w-24"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Frame every visible figure (F frames the selection)",
						className: chip(false),
						onClick: () => engine.frameAll(),
						children: "Frame all"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Frame the selected figure (F)",
						className: chip(false),
						onClick: () => engine.frameSelected(),
						children: "Frame"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Reset camera to the default view",
						className: chip(false),
						onClick: () => engine.resetCamera(),
						children: "Reset"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Undo (Ctrl+Z)",
						className: chip(false),
						onClick: () => engine.undo(),
						children: "Undo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Redo (Ctrl+Shift+Z)",
						className: chip(false),
						onClick: () => engine.redo(),
						children: "Redo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Keyboard shortcuts (?)",
						className: chip(false),
						onClick: () => setHelp(true),
						children: "?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-auto hidden text-xs text-muted sm:inline",
						children: [
							state.figures.length,
							"/4 · ",
							state.jointLimits ? "Limits on" : "Limits off"
						]
					})
				]
			}),
			help && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Help, { onClose: () => setHelp(false) })
		]
	});
}
function panelClass(show) {
	return `${show ? "flex" : "hidden"} min-h-0 flex-col border-line bg-surface lg:max-h-none`;
}
function chip(active) {
	return `min-h-11 shrink-0 rounded-sm border px-2 text-xs ${active ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface-2 text-fg"}`;
}
function btn(active = false) {
	return `min-h-11 shrink-0 rounded-sm border px-2 text-xs ${active ? "border-accent text-accent" : "border-line bg-surface-2 text-fg hover:border-accent"} disabled:opacity-40`;
}
function FigurePanel({ engine, figures, selected, atCap }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scroll-thin flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-sm font-semibold tracking-wide",
					children: "Posewright"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: atCap ? "Four figures is the maximum" : "Add a figure",
					className: btn(),
					disabled: atCap,
					onClick: () => engine.addFigure(),
					children: "Add figure"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1",
				children: figures.map((fig) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: `flex items-center gap-2 rounded-sm border px-2 py-1 ${fig.id === selected?.id ? "border-accent" : "border-line"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						title: `Select ${fig.name}`,
						className: "flex min-h-11 flex-1 items-center gap-2 text-left text-sm",
						onClick: () => engine.selectFigure(fig.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-block size-3 rounded-full",
							style: { background: fig.color }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: fig.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: fig.visible ? "Hide figure" : "Show figure",
						className: btn(),
						onClick: () => engine.setVisible(fig.id, !fig.visible),
						children: fig.visible ? "Hide" : "Show"
					})]
				}, fig.id))
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Duplicate this figure",
						className: btn(),
						disabled: atCap,
						onClick: () => engine.duplicateSelected(),
						children: "Duplicate"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Delete the selected figure (Del)",
						className: btn(),
						onClick: () => engine.deleteSelected(),
						children: "Delete"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-muted",
					title: "Figure name",
					children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "mt-1 w-full rounded-sm border border-line bg-bg px-2 py-1 text-sm text-fg",
						value: selected.name,
						onChange: (e) => engine.rename(selected.id, e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-muted",
					title: "Named body presets",
					children: ["Preset", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-1 w-full rounded-sm border border-line bg-bg px-2 py-1 text-sm text-fg",
						defaultValue: "",
						onChange: (e) => {
							if (e.target.value) engine.applyBodyPreset(selected.id, e.target.value);
							e.target.value = "";
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Apply a preset…"
						}), BODY_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Params, {
					engine,
					figure: selected
				})
			] }),
			!selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Add a figure to start posing."
			})
		]
	});
}
function Params({ engine, figure }) {
	const p = figure.params;
	const lim = heightLimits(p.age);
	const set = (patch) => engine.setParams(figure.id, patch);
	const sexLabel = p.sex < .34 ? "Female" : p.sex > .66 ? "Male" : "Androgynous";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Sex presentation",
			title: "Blends shoulder, hip, and chest proportions",
			min: 0,
			max: 1,
			step: .01,
			value: p.sex,
			display: sexLabel,
			onChange: (v) => set({ sex: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Age",
			title: "Head-to-body ratio, limb share, height range, and a slight stoop after 55",
			min: 5,
			max: 80,
			step: 1,
			value: p.age,
			display: `${Math.round(p.age)} y`,
			onChange: (v) => {
				const next = heightLimits(v);
				set({
					age: v,
					heightCm: Math.min(next.max, Math.max(next.min, p.heightCm))
				});
			},
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Height",
			title: `Centimeters, limited to ${Math.round(lim.min)}–${Math.round(lim.max)} for this age`,
			min: lim.min,
			max: lim.max,
			step: 1,
			value: p.heightCm,
			display: `${Math.round(p.heightCm)} cm`,
			onChange: (v) => set({ heightCm: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Body mass",
			title: "Girth, especially waist and thighs",
			min: 0,
			max: 1,
			step: .01,
			value: p.mass,
			display: p.mass.toFixed(2),
			onChange: (v) => set({ mass: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Muscularity",
			title: "Limb thickness without adding as much waist",
			min: 0,
			max: 1,
			step: .01,
			value: p.muscle,
			display: p.muscle.toFixed(2),
			onChange: (v) => set({ muscle: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Shoulder width",
			title: "Multiplier on biacromial breadth",
			min: .75,
			max: 1.35,
			step: .01,
			value: p.shoulder,
			display: p.shoulder.toFixed(2),
			onChange: (v) => set({ shoulder: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Hip width",
			title: "Multiplier on bi-iliac breadth",
			min: .75,
			max: 1.35,
			step: .01,
			value: p.hip,
			display: p.hip.toFixed(2),
			onChange: (v) => set({ hip: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Torso length",
			title: "Share of height between hip and shoulder",
			min: .82,
			max: 1.2,
			step: .01,
			value: p.torso,
			display: p.torso.toFixed(2),
			onChange: (v) => set({ torso: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Leg length",
			title: "Share of height in the legs. Total height stays fixed.",
			min: .82,
			max: 1.2,
			step: .01,
			value: p.leg,
			display: p.leg.toFixed(2),
			onChange: (v) => set({ leg: v }),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
			label: "Scale",
			title: "Uniform scale of the whole figure",
			min: .4,
			max: 1.8,
			step: .01,
			value: figure.scale,
			display: figure.scale.toFixed(2),
			onChange: (v) => engine.setScale(v),
			onDirty: () => engine.pushHistory()
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: "Drop the figure so the soles meet the ground",
				className: btn(),
				onClick: () => engine.snapFeet(),
				children: "Snap feet"
			})
		})
	] });
}
function Slider({ label, title, min, max, step, value, display, onChange, onDirty }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-2 block text-xs text-muted",
		title,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-fg",
				children: display
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "mt-1 w-full",
			type: "range",
			min,
			max,
			step,
			value,
			onPointerDown: onDirty,
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
function PosePanel({ engine, figure, limits, tool }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scroll-thin flex min-h-0 flex-1 flex-col gap-3 overflow-auto border-b border-line p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Pose"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: figure.ik ? "IK is on. Drag hands, feet, head, or hips. Other chain joints follow." : "FK is on. Select a joint and rotate it. G moves the figure, R rotates the joint."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Forward kinematics (R rotates the selected joint)",
						className: btn(!figure.ik),
						onClick: () => engine.setIk(false),
						children: "FK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Inverse kinematics for hands, feet, head, and pelvis",
						className: btn(figure.ik),
						onClick: () => engine.setIk(true),
						children: "IK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Move the figure or an IK target (G)",
						className: btn(tool === "translate"),
						onClick: () => engine.setTool("translate"),
						children: "Move"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Rotate the selected joint, or yaw the figure (R)",
						className: btn(tool === "rotate"),
						onClick: () => engine.setTool("rotate"),
						children: "Rotate"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Scale the whole figure",
						className: btn(tool === "scale"),
						onClick: () => engine.setTool("scale"),
						children: "Scale"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Clamp joints to anatomical ranges",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: limits,
					onChange: (e) => engine.setJointLimits(e.target.checked)
				}), "Joint limits"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Show or hide joint handles",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: engine.state.showJoints,
					onChange: (e) => engine.setShowJoints(e.target.checked)
				}), "Joint handles"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Show or hide the ground grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: engine.state.showGrid,
					onChange: (e) => engine.setShowGrid(e.target.checked)
				}), "Ground grid"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: "Copy the left side onto the right",
					className: btn(),
					onClick: () => engine.mirror("L2R"),
					children: "Mirror L → R"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: "Copy the right side onto the left",
					className: btn(),
					onClick: () => engine.mirror("R2L"),
					children: "Mirror R → L"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 text-xs text-muted",
				children: "Pose presets"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: POSE_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: `Apply the ${p.name} pose`,
					className: btn(),
					onClick: () => engine.applyPosePreset(p.id),
					children: p.name
				}, p.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1 text-xs text-muted",
				children: "Hands"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: HANDS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					title: `Both hands: ${h.label}`,
					className: btn(),
					onClick: () => engine.applyHand("both", h.id),
					children: h.label
				}, h.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download this figure's pose as JSON",
						className: btn(),
						onClick: () => engine.savePose(),
						children: "Save pose"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						title: "Load a pose JSON onto the selected figure",
						className: btn(),
						children: ["Load pose", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "application/json",
							className: "hidden",
							onChange: (e) => {
								const file = e.target.files?.[0];
								if (file) engine.loadPose(file);
								e.target.value = "";
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download the whole scene as JSON",
						className: btn(),
						onClick: () => engine.saveScene(),
						children: "Save scene"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						title: "Load a scene JSON",
						className: btn(),
						children: ["Load scene", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "application/json",
							className: "hidden",
							onChange: (e) => {
								const file = e.target.files?.[0];
								if (file) engine.loadScene(file);
								e.target.value = "";
							}
						})]
					})
				]
			})
		]
	});
}
function ExportPanel({ engine, warning, settings, previews, count }) {
	const snapped = snapResolution(settings.width, settings.height);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "scroll-thin flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Export for ComfyUI"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "text-xs text-muted",
				title: "Output size. Custom sizes snap to a multiple of 8.",
				children: ["Resolution", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-1 w-full rounded-sm border border-line bg-bg px-2 py-1 text-sm text-fg",
					value: settings.preset,
					onChange: (e) => {
						const id = e.target.value;
						const preset = RESOLUTIONS.find((r) => r.id === id);
						if (!preset) return;
						engine.setExport({
							preset: id,
							width: preset.width,
							height: preset.height
						});
					},
					children: RESOLUTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: r.id,
						children: r.label
					}, r.id))
				})]
			}),
			settings.preset === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-muted",
					title: "Width in pixels",
					children: ["W", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						className: "mt-1 w-full rounded-sm border border-line bg-bg px-2 py-1 text-sm text-fg",
						value: settings.width,
						onChange: (e) => engine.setExport({
							preset: "custom",
							width: Number(e.target.value)
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "text-xs text-muted",
					title: "Height in pixels",
					children: ["H", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						className: "mt-1 w-full rounded-sm border border-line bg-bg px-2 py-1 text-sm text-fg",
						value: settings.height,
						onChange: (e) => engine.setExport({
							preset: "custom",
							height: Number(e.target.value)
						})
					})]
				})]
			}),
			snapped.warn64 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-warn",
				children: "Size is not a multiple of 64. Many SD checkpoints prefer that."
			}),
			warning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-warn",
				children: warning
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "DWPose-style hands (21 points) and 68 face landmarks",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.includeHandsFace,
					onChange: (e) => engine.setExport({ includeHandsFace: e.target.checked })
				}), "Include hands and face"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Drop keypoints hidden behind the body. Off by default.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.hideOccluded,
					onChange: (e) => engine.setExport({ hideOccluded: e.target.checked })
				}), "Hide occluded keypoints"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Draw the OpenPose skeleton on the live view to check alignment",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.overlay !== "off",
					onChange: (e) => engine.setExport({ overlay: e.target.checked ? "skeleton" : "off" })
				}), "Skeleton on view"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download the OpenPose PNG",
						className: btn(),
						onClick: () => void engine.download("openpose"),
						children: "OpenPose"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download the wireframe PNG",
						className: btn(),
						onClick: () => void engine.download("wire"),
						children: "Wireframe"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download the depth PNG",
						className: btn(),
						onClick: () => void engine.download("depth"),
						children: "Depth"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download the normal PNG",
						className: btn(),
						onClick: () => void engine.download("normal"),
						children: "Normal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download the combined color mask",
						className: btn(),
						onClick: () => void engine.download("mask"),
						children: "Mask"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Download OpenPose JSON",
						className: btn(),
						onClick: () => void engine.downloadJson(),
						children: "JSON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Zip every conditioning image (E in orbit mode)",
						className: btn(true),
						onClick: () => void engine.exportAll(),
						children: "Export all"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Black lines on white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.wireInvert,
					onChange: (e) => engine.setExport({ wireInvert: e.target.checked })
				}), "Invert wire"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Color each figure's wireframe",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.wireColored,
					onChange: (e) => engine.setExport({ wireColored: e.target.checked })
				}), "Colored wire"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "X-ray: draw hidden edges too",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.wireXray,
					onChange: (e) => engine.setExport({ wireXray: e.target.checked })
				}), "X-ray wire"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Smooth the wire edges. Off is crisper for Canny-style ControlNets.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.wireAA,
					onChange: (e) => engine.setExport({ wireAA: e.target.checked })
				}), "Antialias wire"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
				label: "Wire thickness",
				title: "Edge width in the wireframe export, in pixels at the preview size and scaled in the shader",
				min: .6,
				max: 3.5,
				step: .05,
				value: settings.wireThickness,
				display: settings.wireThickness.toFixed(2),
				onChange: (v) => engine.setExport({ wireThickness: v }),
				onDirty: () => {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center gap-2 text-sm",
				title: "Fit depth white-to-black to the figures instead of the camera planes",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: settings.depthAuto,
					onChange: (e) => engine.setExport({ depthAuto: e.target.checked })
				}), "Auto depth range"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1",
				children: [
					["pose", "Pose"],
					["wire", "Wire"],
					["align", "Align"],
					["depth", "Depth"],
					["normal", "Normal"],
					["mask", "Mask"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
					className: "overflow-hidden rounded-sm border border-line bg-bg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: (el) => {
							previews.current[id] = el;
						},
						className: "aspect-square w-full bg-bg",
						title: `${label} preview. Align composites the skeleton on the wireframe.`
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
						className: "px-1 py-0.5 text-xs text-muted",
						children: label
					})]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					count,
					" figure",
					count === 1 ? "" : "s",
					" in the scene. The frame overlay matches the export crop."
				]
			})
		]
	});
}
function Help({ onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-20 grid place-items-center bg-bg/70 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-full w-full max-w-md overflow-auto rounded-md border border-line bg-surface p-4",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-base font-semibold",
					children: "Shortcuts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
					className: "w-full text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: [
						["Left drag", "Orbit (or fly-look after click)"],
						["Right drag", "Pan"],
						["Scroll", "Zoom"],
						["C", "Toggle orbit / fly"],
						["WASD", "Fly move. A left, D right"],
						["Q / E", "Fly down / up (orbit: E exports)"],
						["Shift", "Fly faster"],
						["G / R", "Move gizmo / rotate gizmo"],
						["F", "Frame selection"],
						["Tab", "Cycle figures"],
						["Del", "Delete figure"],
						["Ctrl+Z", "Undo"],
						["Ctrl+Shift+Z", "Redo"],
						["?", "This sheet"]
					].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1 pr-3 font-mono text-accent",
							children: k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-1 text-muted",
							children: v
						})]
					}, k)) })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: `${btn()} mt-3`,
					onClick: onClose,
					title: "Close the shortcut sheet",
					children: "Close"
				})
			]
		})
	});
}
//#endregion
export { PoserApp };
