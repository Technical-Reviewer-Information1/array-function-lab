(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  function code(box, lines, on) {
    $(box).innerHTML = lines.map((s, k) =>
      '<span class="ln' + (k + 1 === on ? ' on' : '') + '">(' + String(k + 1).padStart(2, '0') + ') ' + esc(s) + '</span>').join('');
  }

  /* ============ STEP 1 ============ */
  let JIKAN = [120, 100, 180, 200, 145, 115, 170];
  const BOOKJIKAN = JIKAN.slice();
  const YOUBI = ['月', '火', '水', '木', '金', '土', '日'];
  const A_LINES = () => [
    'Shiyou_jikan = [' + JIKAN.join(', ') + ']',
    'Youbi = ["月", "火", "水", "木", "金", "土", "日"]',
    'j = -1', 'goukei = 0', 'max_jikan = 0',
    'i を 0 から 要素数(Shiyou_jikan)-1 まで 1 ずつ増やしながら繰り返す:',
    '│ goukei = goukei + Shiyou_jikan[i]',
    '│ もし Shiyou_jikan[i] > max_jikan ならば:',
    '│ │ max_jikan = Shiyou_jikan[i]',
    '└ └ j = i',
    '表示する("合計使用時間：", goukei)',
    '表示する("使用時間が最も多い曜日：", Youbi[j])',
    '表示する("最大使用時間：", max_jikan)'
  ];
  function aBuild() {
    const fr = []; let g = 0, mx = 0, j = -1;
    fr.push({ line: 5, i: -1, g: 0, mx: 0, j: -1, msg: 'goukei ＝ 0、max_jikan ＝ 0、j ＝ −1 を用意しました。<strong>j は「まだ見つかっていない」印として −1</strong> にしています。' });
    for (let i = 0; i < JIKAN.length; i++) {
      const b = g; g += JIKAN[i];
      fr.push({ line: 7, i: i, g: g, mx: mx, j: j,
        msg: 'goukei ＝ ' + b + ' ＋ Shiyou_jikan[' + i + ']（＝' + JIKAN[i] + '） ＝ <strong>' + g + '</strong>' });
      const hit = JIKAN[i] > mx;
      fr.push({ line: 8, i: i, g: g, mx: mx, j: j,
        msg: 'Shiyou_jikan[' + i + ']（＝' + JIKAN[i] + '） &gt; max_jikan（＝' + mx + '） は <strong>' + (hit ? '真' : '偽') + '</strong>' });
      if (hit) {
        mx = JIKAN[i]; j = i;
        fr.push({ line: 10, i: i, g: g, mx: mx, j: j,
          msg: '新しい最大が見つかりました。max_jikan ＝ <strong>' + mx + '</strong>、j ＝ <strong>' + j + '</strong>（' + YOUBI[j] + '曜日の場所）' });
      }
    }
    fr.push({ line: 12, i: -1, g: g, mx: mx, j: j,
      msg: '<strong>合計 ' + g + ' 分、最も多いのは ' + YOUBI[j] + '曜日の ' + mx + ' 分。</strong>Youbi[' + j + '] で曜日名を取り出せました。' });
    return fr;
  }
  function aRender(fr, k) {
    const f = fr[k];
    code('aCode', A_LINES(), f.line);
    $('aArr').innerHTML = JIKAN.map((v, x) =>
      '<div class="c ' + (x === f.i ? 'now' : (x === f.j ? 'max' : (f.i >= 0 && x < f.i ? 'past' : ''))) + '">' +
      v + '<em>[' + x + '] ' + YOUBI[x] + '</em></div>').join('');
    $('aI').textContent = f.i < 0 ? '—' : f.i;
    $('aG').textContent = f.g; $('aM').textContent = f.mx; $('aJ').textContent = f.j;
    const n = $('aNote'); n.className = 'note ' + (k === fr.length - 1 ? 'ok' : 'info'); n.innerHTML = f.msg;
    $('aProg').textContent = (k + 1) + ' / ' + fr.length;
  }
  function stepper(pre, build, render) {
    let fr = build(), i = 0, timer = null;
    function rebuild() { fr = build(); i = 0; stop(); show(); }
    function show() { render(fr, i); $(pre + 'Step').disabled = i >= fr.length - 1; }
    function stop() { if (timer) clearInterval(timer); timer = null; if ($(pre + 'Play')) $(pre + 'Play').textContent = '自動で動かす'; }
    $(pre + 'Step').addEventListener('click', () => { if (i < fr.length - 1) { i++; show(); } });
    $(pre + 'Reset').addEventListener('click', () => { i = 0; stop(); show(); });
    if ($(pre + 'Play')) $(pre + 'Play').addEventListener('click', () => {
      if (timer) { stop(); return; }
      $(pre + 'Play').textContent = '止める';
      timer = setInterval(() => { if (i >= fr.length - 1) { stop(); return; } i++; show(); }, 520);
    });
    show();
    return { rebuild: rebuild };
  }

  /* ============ STEP 2 硬貨 ============ */
  const KOUKA = [1, 5, 10, 50, 100, 500];
  const K_LINES = [
    'Kouka = [1, 5, 10, 50, 100, 500]', 'kingaku = 【外部からの入力】', 'maisu = 0, nokori = kingaku',
    'i を 5 から 0 まで 1 ずつ減らしながら繰り返す:',
    '│ maisu = maisu + nokori ÷ Kouka[i]', '└ nokori = nokori % Kouka[i]', '表示する(maisu)'
  ];
  function drawK() {
    const kin = +$('kIn').value;
    $('kInV').textContent = kin;
    code('kCode', K_LINES, 0);
    let nokori = kin, maisu = 0, rows = [];
    for (let i = 5; i >= 0; i--) {
      const n = Math.floor(nokori / KOUKA[i]);
      rows.push({ c: KOUKA[i], n: n, before: nokori, after: nokori % KOUKA[i] });
      maisu += n; nokori = nokori % KOUKA[i];
    }
    $('kCoins').innerHTML = rows.map(r =>
      '<div class="r' + (r.n ? ' on' : '') + '"><span>' + r.c + '円</span>' +
      '<span style="color:var(--muted);font-size:.8rem">' + r.before + ' ÷ ' + r.c + ' ＝ ' + r.n + '　余り ' + r.after + '</span>' +
      '<span class="n">' + r.n + ' 枚</span></div>').join('');
    const n = $('kNote'); n.className = 'note ok';
    n.innerHTML = '<strong>合計 ' + maisu + ' 枚</strong>です。' +
      '「÷」で<strong>何枚使えるか</strong>、「%」で<strong>次に回す余り</strong>を求めます。この2つの演算子の使い分けが要点です。';
  }

  /* ============ STEP 3 二次元配列 ============ */
  const TENSU = [[90, 80], [62, 75], [59, 91], [78, 64], [85, 88]];
  const T_LINES = ['Tensu = [[90, 80], [62, 75], [59, 91], …]',
    'i を 0 から 39 まで 1 ずつ増やしながら繰り返す:',
    '└ 表示する((Tensu[i][0] + Tensu[i][1]) / 2)'];
  function drawT(pick) {
    code('tCode', T_LINES, pick ? 3 : 0);
    let h = '<thead><tr><th></th><th>国語 [0]</th><th>数学 [1]</th><th>平均</th></tr></thead><tbody>';
    TENSU.forEach((row, i) => {
      h += '<tr><th>[' + i + '] さん</th>' + row.map((v, j) =>
        '<td class="' + (pick && pick[0] === i && pick[1] === j ? 'pick' : (pick && pick[0] === i ? 'rowhit' : '')) + '" data-i="' + i + '" data-j="' + j + '">' + v + '</td>').join('') +
        '<td class="sum">' + ((row[0] + row[1]) / 2) + '</td></tr>';
    });
    $('tMat').innerHTML = h + '</tbody>';
    $('tMat').querySelectorAll('td[data-i]').forEach(td => td.addEventListener('click', () => drawT([+td.dataset.i, +td.dataset.j])));
    const n = $('tNote');
    if (!pick) { n.className = 'note info'; n.textContent = 'マスをクリックしてください。'; return; }
    const [i, j] = pick;
    n.className = 'note ok';
    n.innerHTML = 'ここは <strong class="mono">Tensu[' + i + '][' + j + ']</strong> ＝ ' + TENSU[i][j] + ' です。<br>' +
      '<span class="mono">Tensu[' + i + ']</span> は ' + i + ' 番目の人の配列 <span class="mono">[' + TENSU[i].join(', ') + ']</span>、' +
      'そこから <span class="mono">[' + j + ']</span> で ' + (j === 0 ? '国語' : '数学') + 'の点を取り出しています。<br>' +
      'この人の平均は <span class="mono">(Tensu[' + i + '][0] + Tensu[' + i + '][1]) / 2 ＝ ' + ((TENSU[i][0] + TENSU[i][1]) / 2) + '</span>。';
  }

  /* ============ STEP 4 出席簿 ============ */
  /* 2-8 問2 は「配列の添字は 1 から始まる」問題。正誤表（P.66）で (03)(04) 行が
     「1 から 要素数 まで」に修正されたため、表示も 1 始まりにそろえている。 */
  const S_LINES = ['Syussekibo = [[0, 1, …][0, 0, …]…]', 'Ninzu = [0, 0, …, 0], Nissu = [0, 0, …, 0]',
    'i を 1 から 要素数(Syussekibo) まで 1 ずつ増やしながら繰り返す:',
    '│ j を 1 から 要素数(Syussekibo[i]) まで 1 ずつ増やしながら繰り返す:',
    '│ │ Ninzu[i] = Ninzu[i] + Syussekibo[i][j]',
    '└ └ Nissu[j] = Nissu[j] + Syussekibo[i][j]'];
  const SY = [[0, 1, 0, 0, 1], [0, 0, 0, 1, 0], [1, 0, 0, 0, 0], [0, 0, 1, 1, 0]];
  function drawS() {
    code('sCode', S_LINES, 0);
    const rows = SY.length, cols = SY[0].length;
    let h = '<thead><tr><th></th>' + Array.from({ length: cols }, (_, j) => '<th>番号[' + (j + 1) + ']</th>').join('') + '<th>Ninzu[i]</th></tr></thead><tbody>';
    SY.forEach((r, i) => {
      const rs = r.reduce((a, b) => a + b, 0);
      h += '<tr><th>[' + (i + 1) + ']日目</th>' + r.map((v, j) =>
        '<td data-i="' + i + '" data-j="' + j + '" style="' + (v ? 'color:#c0392b;font-weight:700' : 'color:#858a92') + '">' + v + '</td>').join('') +
        '<td class="sum rowhit">' + rs + '</td></tr>';
    });
    h += '<tr><th>Nissu[j]</th>' + Array.from({ length: cols }, (_, j) =>
      '<td class="sum colhit">' + SY.reduce((a, r) => a + r[j], 0) + '</td>').join('') + '<td class="sum"></td></tr>';
    $('sMat').innerHTML = h + '</tbody>';
    $('sMat').querySelectorAll('td[data-i]').forEach(td => td.addEventListener('click', () => {
      const i = +td.dataset.i, j = +td.dataset.j, I = i + 1, J = j + 1;
      SY[i][j] = SY[i][j] ? 0 : 1; drawS();
      const n = $('sNote'); n.className = 'note ok';
      n.innerHTML = '<span class="mono">Syussekibo[' + I + '][' + J + ']</span> を <strong>' + SY[i][j] + '</strong>（' +
        (SY[i][j] ? '欠席' : '出席') + '）にしました。' +
        '<strong>' + I + '日目の欠席者数（Ninzu[' + I + ']）</strong>と、<strong>番号' + J + 'の欠席日数（Nissu[' + J + ']）</strong>の両方が変わります。';
    }));
    if (!$('sNote').innerHTML) {
      $('sNote').className = 'note info';
      $('sNote').innerHTML = 'マスをクリックすると、出席（0）と欠席（1）が切りかわります。' +
        '<br><strong>この問題だけ添字が 1 から始まります。</strong>問題文に「配列の添字は 1 から始まるものとする」と書かれているからです。' +
        'STEP 3（2-8 問1）は 0 から始まりでした——<strong>添字の始まりは問題文の指定に従います</strong>。';
    }
  }

  /* ============ STEP 5 関数 ============ */
  const F_LINES = ['関数 メッセージ(a, b):', '│ もし a < b ならば:', '│ │ 表示する("不足金額:", b - a, "円")',
    '│ そうでなければ:', '└ └ 表示する("支払後残高:", a - b, "円")',
    'zandaka = 【残高を入力】', 'shiharai = 【支払金額を入力】', 'メッセージ(zandaka, shiharai)'];
  function drawF() {
    const z = +$('zan').value, s = +$('shi').value;
    $('zanV').textContent = z; $('shiV').textContent = s;
    $('argA').textContent = z; $('argB').textContent = s;
    $('inA').textContent = z; $('inB').textContent = s;
    const lack = z < s;
    code('fCode', F_LINES, lack ? 3 : 5);
    const n = $('fNote'); n.className = 'note ' + (lack ? 'ng' : 'ok');
    n.innerHTML = lack
      ? '<strong>不足金額: ' + (s - z) + ' 円</strong> と表示されます。<br>不足額は <span class="mono">b − a</span>（支払 − 残高）。<strong>a − b にすると負の数</strong>になってしまいます。'
      : '<strong>支払後残高: ' + (z - s) + ' 円</strong> と表示されます。<br>残高は <span class="mono">a − b</span>（残高 − 支払）です。';
  }
  const TANKA = [1200, 800, 1500, 300, 999, 2000];
  function drawO(kind) {
    const n = $('oNote');
    if (!kind) { n.className = 'note info'; n.textContent = 'ボタンを押して、順番による違いを見てみましょう。'; return; }
    const idx = TANKA.map((v, i) => i);
    if (kind === 'a') {
      const sorted = TANKA.slice().sort((x, y) => x - y);
      const got = sorted.map((v, i) => i).filter(i => sorted[i] <= 999);
      n.className = 'note ng';
      n.innerHTML = '<strong>取出(整列(Tanka), 999)</strong><br>' +
        '先に <span class="mono">整列</span> すると、単価が [' + sorted.join(', ') + '] に並びかわります。' +
        'このとき<strong>商品IDと単価の対応がくずれてしまう</strong>ので、取り出した添字 [' + got.join(', ') + '] は<strong>もとの商品IDではありません</strong>。' +
        '<br>だからこの順番は誤りです。';
    } else {
      const got = idx.filter(i => TANKA[i] <= 999);
      const sorted = got.slice().sort((x, y) => x - y);
      n.className = 'note ok';
      n.innerHTML = '<strong>整列(取出(Tanka, 999))</strong><br>' +
        '先に <span class="mono">取出</span> で999円以下の<strong>商品ID</strong>を集めると [' + got.join(', ') + ']。' +
        'それを整列して <strong>[' + sorted.join(', ') + ']</strong>。これが正しい順番です。' +
        '<br>関数を組み合わせるときは<strong>内側から先に実行される</strong>ことに注意しましょう。';
    }
  }


  /* ============ 自分のデータ ============ */
  function drawMy() {
    $('myRow').innerHTML = YOUBI.map(function (y, i) {
      return '<label>' + y + '<input type="number" min="0" max="1440" step="5" id="my' + i + '" value="' + JIKAN[i] + '"></label>';
    }).join('');
  }

  /* ============ 実験：添字をずらす ============ */
  function drawOff(kind) {
    const n = JIKAN.length;
    const from = kind === 'from1' ? 1 : 0;
    const to = kind === 'over' ? n : n - 1;
    const lines = [
      'goukei = 0',
      'i を ' + from + ' から ' + (kind === 'ok' ? '要素数(Shiyou_jikan)-1' : (kind === 'over' ? '要素数(Shiyou_jikan)' : '要素数(Shiyou_jikan)-1')) + ' まで 1 ずつ増やしながら繰り返す:',
      '└ goukei = goukei + Shiyou_jikan[i]',
      '表示する(goukei)'
    ];
    code('offCode', lines, 3);
    let g = 0, bad = -1, used = [];
    for (let i = from; i <= to; i++) {
      if (i >= n) { bad = i; break; }
      g += JIKAN[i]; used.push(i);
    }
    const total = JIKAN.reduce((a, b) => a + b, 0);
    $('offArr').innerHTML = JIKAN.map(function (v, x) {
      return '<div class="c ' + (used.indexOf(x) >= 0 ? 'now' : 'past') + '">' + v + '<em>[' + x + '] ' + YOUBI[x] + '</em></div>';
    }).join('') + (bad >= 0 ? '<div class="c ghostcell">？<em>[' + bad + ']</em></div>' : '');
    $('offG').textContent = bad >= 0 ? 'エラー' : g;
    $('offT').textContent = total;
    const nt = $('offNote');
    if (kind === 'ok') {
      nt.className = 'note ok';
      nt.innerHTML = '添字 0〜' + (n - 1) + ' の <strong>' + n + ' 個すべて</strong>を足せました。合計 <strong>' + g + '</strong> 分。これが正しい書き方です。';
    } else if (kind === 'over') {
      nt.className = 'note ng';
      nt.innerHTML = '<strong>i が ' + bad + ' になったところで止まりました。</strong>' +
        '配列にあるのは添字 0〜' + (n - 1) + ' の ' + n + ' 個だけで、<span class="mono">Shiyou_jikan[' + bad + ']</span> は<strong>存在しません</strong>。' +
        '「要素数」と「最後の添字」は1つちがう——ここが選択肢①のわなです。';
    } else {
      nt.className = 'note ng';
      nt.innerHTML = '<strong>' + YOUBI[0] + '曜日（添字0）の ' + JIKAN[0] + ' 分が抜けました。</strong>' +
        '合計は ' + g + ' 分となり、正しい ' + total + ' 分より ' + (total - g) + ' 分少なくなっています。' +
        'エラーは出ないので<strong>気づきにくい間違い</strong>です。添字は 0 から数えます。';
    }
  }

  function init() {
    const aRun = stepper('a', aBuild, aRender);
    $('kIn').addEventListener('input', drawK); drawK();
    drawT(null); drawS(); drawO(null);
    ['zan', 'shi'].forEach(i => $(i).addEventListener('input', drawF)); drawF();
    document.querySelectorAll('[data-fn]').forEach(b => b.addEventListener('click', () => drawO(b.dataset.fn)));

    drawMy();
    document.querySelectorAll('[data-off]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-off]').forEach(x => x.classList.toggle('primary', x === b));
        drawOff(b.dataset.off);
      });
    });
    drawOff('ok');

    $('myGo').addEventListener('click', function () {
      const v = YOUBI.map((_, i) => Math.max(0, Math.min(1440, Number($('my' + i).value) || 0)));
      JIKAN = v; aRun.rebuild(); drawOff(document.querySelector('[data-off].primary').dataset.off);
    });
    $('myBack').addEventListener('click', function () {
      JIKAN = BOOKJIKAN.slice(); drawMy(); aRun.rebuild();
      drawOff(document.querySelector('[data-off].primary').dataset.off);
    });

    Predict.make('pd1', {
      q: '本文のデータ [120, 100, 180, 200, 145, 115, 170] の <strong>合計使用時間</strong>は何分？',
      type: 'num', unit: '分', placeholder: '分',
      answer: function () { return BOOKJIKAN.reduce((a, b) => a + b, 0); },
      show: function (r) { return '1週間で ' + r + ' 分 ＝ 約 ' + (r / 60).toFixed(1) + ' 時間。1日平均 ' + Math.round(r / 7) + ' 分です。'; },
      why: 'プログラムは <span class="mono">goukei = goukei + Shiyou_jikan[i]</span> を7回くり返して、これと同じ計算をしています。'
    });

    Predict.make('pd2', {
      q: 'そのとき、最後に <span class="mono">j</span> に入っている値は？',
      type: 'pick',
      ch: ['200（最大の使用時間）', '3（最大がある場所の添字）', '木（曜日の名前）', '6（最後の添字）'],
      answer: function () { return 1; },
      show: function () { return 'STEP 1 を最後まで進めると、j ＝ 3、max_jikan ＝ 200 になります。'; },
      why: '<strong>j は場所（添字）、max_jikan は値</strong>です。場所を覚えておくから、あとで <span class="mono">Youbi[3]</span> ＝ 「木」を取り出せます。' +
           '値だけ覚えていても、曜日名は分かりません。'
    });

    Predict.make('pd3', {
      q: '789 円をつくるとき、硬貨は全部で何枚必要？（1・5・10・50・100・500円）',
      type: 'num', unit: '枚', placeholder: '枚',
      answer: function () {
        let nokori = 789, maisu = 0;
        for (let i = 5; i >= 0; i--) { maisu += Math.floor(nokori / KOUKA[i]); nokori %= KOUKA[i]; }
        return maisu;
      },
      show: function () { return '500円×1、100円×2、50円×1、10円×3、5円×1、1円×4 で 12 枚。STEP 2 で内訳が見られます。'; },
      why: '大きい硬貨から「÷」で枚数を取り、「%」で余りを次に回す——これがいちばん枚数が少なくなる考え方です。'
    });

    Quiz.choice('bookBox', 'bookNote', [
      { k: '2-7 ア', q: '(06)行目：i をどこからどこまで繰り返すか。',
        ch: ['0から要素数(Shiyou_jikan)−1', '0から要素数(Shiyou_jikan)', '0から要素数(Shiyou_jikan)+1'], a: 0,
        why: '添字は0から始まるので、<strong>最後の添字は 要素数−1</strong>。要素数そのものにすると、ない場所を見てしまいます。' },
      { k: '2-7 イ・ウ', q: '(07)行目：goukei ＝ 【イ】＋【ウ】（2つのうちの1つ）',
        ch: ['Shiyou_jikan[i]', 'Shiyou_jikan[j]', 'Youbi[i]', 'Youbi[j]', 'Shiyou_jikan', 'Youbi', 'goukei', 'max_jikan', 'i', 'j'], a: '6|0',
        why: '「これまでの合計 goukei」＋「いまの値 Shiyou_jikan[i]」です（順不同）。' },
      { k: '2-7 エ', q: '(08)行目：もし【エ】＞ max_jikan ならば',
        ch: ['Shiyou_jikan[i]', 'Shiyou_jikan[j]', 'Youbi[i]', 'Youbi[j]', 'Shiyou_jikan', 'Youbi', 'goukei', 'max_jikan', 'i', 'j'], a: 0,
        why: 'いま見ている値 <span class="mono">Shiyou_jikan[i]</span> と、これまでの最大を比べます。' },
      { k: '2-7 オ', q: '(09)行目：【オ】＝【エ】',
        ch: ['Shiyou_jikan[i]', 'Shiyou_jikan[j]', 'Youbi[i]', 'Youbi[j]', 'Shiyou_jikan', 'Youbi', 'goukei', 'max_jikan', 'i', 'j'], a: 7,
        why: '新しい最大なので <span class="mono">max_jikan</span> を更新します。' },
      { k: '2-7 カ', q: '(10)行目：j ＝ ？',
        ch: ['Shiyou_jikan[i]', 'Shiyou_jikan[j]', 'Youbi[i]', 'Youbi[j]', 'Shiyou_jikan', 'Youbi', 'goukei', 'max_jikan', 'i', 'j'], a: 8,
        why: '<strong>値ではなく「場所」を覚えます。</strong>j に i を入れておけば、あとで Youbi[j] で曜日を取り出せます。' },
      { k: '2-7 キ', q: '硬貨のプログラム：(04)行目の繰り返しは。',
        ch: ['5から0まで1ずつ減らし', '4から0まで1ずつ減らし', '0から4まで1ずつ増やし', '0から5まで1ずつ増やし'], a: 0,
        why: '硬貨は6種類（添字0〜5）で、<strong>大きい500円（添字5）から</strong>調べます。STEP 2 で確かめられます。' },
      { k: '2-7 ク', q: '(05)行目：maisu ＝【ク】＋【ケ】の【ク】',
        ch: ['1', 'maisu', 'i', 'nokori'], a: 1,
        why: 'これまでの枚数に足していくので <span class="mono">maisu</span> です。' },
      { k: '2-7 ケ', q: '【ケ】（足す枚数）は。',
        ch: ['nokori ÷ Kouka[i]', 'nokori % Kouka[i]', 'maisu ÷ Kouka[i]', 'maisu % Kouka[i]'], a: 0,
        why: '「残りをその硬貨で何枚分にできるか」なので<strong>割り算の商</strong>です。' },
      { k: '2-7 コ', q: '(06)行目：nokori ＝ ？',
        ch: ['nokori ÷ Kouka[i]', 'nokori % Kouka[i]', 'maisu ÷ Kouka[i]', 'maisu % Kouka[i]'], a: 1,
        why: '次の硬貨に回すのは<strong>余り</strong>なので % です。' },
      { k: '2-8 ア', q: '各生徒の平均点を表示する式は。',
        ch: ['Tensu[i] / 2', '(Tensu[0] + Tensu[1]) / 2', '(Tensu[i][0] + Tensu[i][1]) / 2', '(Tensu[0][i] + Tensu[1][i]) / 2'], a: 2,
        why: '<strong>1つ目の添字が「何人目」</strong>。i を動かすのは1つ目です。③は行と列が逆になっています。STEP 3 でマスを押して確かめられます。' },
      { k: '2-8 イ', q: '(05)行目：Ninzu[【イ】]',
        ch: ['i', 'j', 'i + j', 'Ninzu[i]', 'Ninzu[j]', 'Nissu[i]', 'Nissu[j]', 'Syussekibo[i][j]'], a: 0,
        why: 'Ninzu は「その日の欠席者数」。日を表すのは <strong>i</strong> です。' },
      { k: '2-8 ウ・エ', q: '(05)行目：＝【ウ】＋【エ】（2つのうちの1つ）',
        ch: ['i', 'j', 'i + j', 'Ninzu[i]', 'Ninzu[j]', 'Nissu[i]', 'Nissu[j]', 'Syussekibo[i][j]'], a: '3|7',
        why: '<span class="mono">Ninzu[i] = Ninzu[i] + Syussekibo[i][j]</span>。これまでの合計に、いまのマスを足します（順不同）。' },
      { k: '2-8 オ', q: '(06)行目：Nissu[【オ】]',
        ch: ['i', 'j', 'i + j', 'Ninzu[i]', 'Ninzu[j]', 'Nissu[i]', 'Nissu[j]', 'Syussekibo[i][j]'], a: 1,
        why: 'Nissu は「その生徒の欠席日数」。生徒を表すのは <strong>j</strong> です。' },
      { k: '2-8 カ・キ', q: '(06)行目：＝【カ】＋【キ】（2つのうちの1つ）',
        ch: ['i', 'j', 'i + j', 'Ninzu[i]', 'Ninzu[j]', 'Nissu[i]', 'Nissu[j]', 'Syussekibo[i][j]'], a: '6|7',
        why: '<span class="mono">Nissu[j] = Nissu[j] + Syussekibo[i][j]</span>（順不同）。形は同じで、<strong>添字だけが違う</strong>のがポイントです。' },
      { k: '2-9 ア', q: '1000円未満の商品IDを昇順に並べる式は。',
        ch: ['取出(整列(Tanka), 999)', '取出(整列(Tanka), 1000)', '整列(取出(Tanka, 999))', '整列(取出(Tanka, 1000))'], a: 2,
        why: '先に整列すると<strong>商品IDとの対応がくずれます</strong>。また「1000円未満」＝<strong>999円以下</strong>。STEP 5 の下で見比べられます。' },
      { k: '2-9 イ', q: '(02)行目：もし a【イ】b ならば',
        ch: ['&gt;', '&gt;=', '&lt;=', '&lt;'], a: 3,
        why: '<strong>残高 &lt; 支払金額</strong>のときが「不足」です。' },
      { k: '2-9 ウ', q: '(03)行目：不足金額は。',
        ch: ['zandaka − shiharai', 'shiharai − zandaka', 'a − b', 'b − a'], a: 3,
        why: '関数の中では <span class="mono">a</span>・<span class="mono">b</span> という名前で受け取っています。不足額は <span class="mono">b − a</span>。' },
      { k: '2-9 エ', q: '(05)行目：支払後残高は。',
        ch: ['zandaka − shiharai', 'shiharai − zandaka', 'a − b', 'b − a'], a: 2,
        why: '残高から支払を引くので <span class="mono">a − b</span> です。' }
    ], '本文の答えは、2-7【ア】⓪【イ】⑥【ウ】⓪（順不同）【エ】⓪【オ】⑦【カ】⑧【キ】⓪【ク】①【ケ】⓪【コ】①　' +
        '2-8【ア】②【イ】⓪【ウ】・【エ】③・⑦（順不同）【オ】①【カ】・【キ】⑥・⑦（順不同）　2-9【ア】②【イ】③【ウ】③【エ】② です。');

    window.Terms.glossary($('glossBox'), ['配列', '添字', '変数', '関数', '引数', '戻り値', 'アルゴリズム', 'トレース']);
    window.Terms.attach();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
