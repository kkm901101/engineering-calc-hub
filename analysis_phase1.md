# 공학·전기 웹 허브 프로젝트 1단계 분석 보고서 (Phase 1)
**작성자:** 시니어 데이터 분석가 & 풀스택 엔지니어  
**대상 서비스:** 글로벌(영어권) 고단가 애드센스 타깃 공학·전기 계산기 웹 허브  
**문서 버전:** 1.0.0  

---

## 1. 핵심 수식 및 입출력 분석

### 1.1 배터리 가동/방전 시간 계산기 (Battery Run-Time Calculator)

#### (1) 개요 및 공학적 배경
배터리 가동 시간은 이상적인 조건에서는 단순 용량과 방전 전류의 비율($T = C / I$)로 산출되지만, 실제로는 화학적 손실, Peukert 효과(Peukert's Law), 인버터/변환기 효율($\eta$), 배터리 방전 심도(Depth of Discharge, DoD)에 따라 가용 시간이 크게 단축됩니다. 실무 엔지니어와 DIY 사용자(태양광, 캠핑, RC, UPS 설계자)를 만족시키기 위해 기본 산식과 Peukert 산식을 모두 지원해야 합니다.

#### (2) 핵심 수식
- **선형 표준 수식 (기본 모드):**
  $$T \text{ (시간)} = \frac{C \times (DoD / 100) \times \eta}{I}$$
  - $C$: 배터리 정격 용량 (Ah 또는 mAh, $1 \text{ Ah} = 1000 \text{ mAh}$)
  - $I$: 소비 전류 (A 또는 mA, 또는 소비 전력 $P \text{ (W)} / V \text{ (V)}$)
  - $DoD$: 권장 방전 심도 (납축전지: 약 50%, 리튬이온/인산철: 80~90%)
  - $\eta$: 변환 효율 계수 (통상 0.85 ~ 0.95)

- **Peukert의 법칙 (고급 정밀 모드 - 특히 납축/고방전 배터리):**
  $$T = H \times \left( \frac{C}{I \times H} \right)^k$$
  - $H$: 공칭 방전 시간률 (대부분의 배터리는 20시간률 기준, 즉 $H = 20\text{ h}$)
  - $k$: Peukert 상수 (리튬이온: 1.05 ~ 1.15, 납축전지: 1.1 ~ 1.3, AGM: 1.05 ~ 1.2)

#### (3) 입출력 변수 스펙
- **입력 (Inputs):**
  - Battery Capacity: 숫자 입력 + 단위 드롭다운 (`Ah`, `mAh`)
  - Battery Voltage: 숫자 입력 (`V`, 기본값 12V)
  - Load / Discharge Current: 숫자 입력 + 단위 토글 (`A`, `mA`, `Watts`)
  - Battery Type (사전 프리셋): Lead-Acid (DoD 50%, k=1.25), LiFePO4 (DoD 90%, k=1.05), Li-ion (DoD 80%, k=1.10), Custom
  - Efficiency ($\eta$): 슬라이더 (70% ~ 100%, 기본값 90%)
- **출력 (Outputs):**
  - Run Time: `시간(Hours) + 분(Minutes)` 형태로 직관적 포맷팅
  - Energy Delivered: 유효 공급 에너지량 (`Wh`, `kWh`)
  - Remaining Capacity: 방전 후 잔여 권장 용량

---

### 1.2 케이블 전압 강하 및 굵기 계산기 (Voltage Drop & Wire Size Calculator)

#### (1) 개요 및 공학적 배경
전선에 전류가 흐르면 도체의 고유 저항으로 인해 전압 강하(Voltage Drop)가 발생합니다. 전압 강하가 심하면 기기 오작동, 모터 과열, 화재 위험이 발생하므로 NEC(미국전기규정)에서는 분기 회로 최대 전압 강하를 3% 이내, 간선 포함 5% 이내로 제한하도록 권고합니다.

#### (2) 도체 저항률 ($\rho$) 표준값 ($20^\circ\text{C}$ 기준)
- 구리(Copper, Annealed): $\rho \approx 1.72 \times 10^{-8} \ \Omega \cdot \text{m}$ (또는 $10.4 \ \Omega \cdot \text{cmil/ft}$)
- 알루미늄(Aluminum): $\rho \approx 2.82 \times 10^{-8} \ \Omega \cdot \text{m}$ (또는 $17.0 \ \Omega \cdot \text{cmil/ft}$)
- 온도 보정 계수: $R_T = R_{20}[1 + \alpha(T - 20)]$ (구리 온도계수 $\alpha \approx 0.00393/\Delta^\circ\text{C}$)

#### (3) 핵심 수식
- **선로 왕복 저항 ($R$):**
  $$R = \rho \times \frac{2 \times L}{A} \quad (\text{단상 및 DC는 왕복선이므로 } 2L)$$
  $$\text{3상 평형 회로의 경우 도체 1가닥 길이 적용: } R_{3\phi} = \rho \times \frac{\sqrt{3} \times L}{A}$$
  - $L$: 선로 편도 거리 (m 또는 ft)
  - $A$: 도체 단면적 ($\text{mm}^2$ 또는 circular mils)

- **전압 강하 ($V_{drop}$ 및 $V_{\%}$):**
  - **DC / 단상 AC:**
    $$V_{drop} = 2 \times I \times L \times \frac{\rho}{A}$$
  - **3상 AC (평형 부하):**
    $$V_{drop} = \sqrt{3} \times I \times L \times \frac{\rho}{A}$$
  - **전압 강하율 (%):**
    $$V_{\%} = \left( \frac{V_{drop}}{V_{source}} \right) \times 100$$

- **AWG(American Wire Gauge)와 단면적($\text{mm}^2$) 환산 공식:**
  $$d_n = 0.127 \times 92^{(36 - n)/39} \text{ mm}$$
  $$A_n = \frac{\pi}{4} d_n^2 \quad (00 \text{은 } n=-1, 000 \text{은 } n=-2 \dots)$$

#### (4) 입출력 변수 스펙
- **입력 (Inputs):**
  - Phase / Source Type: `DC`, `AC Single-Phase`, `AC 3-Phase`
  - Nominal Voltage: `12V`, `24V`, `48V`, `120V`, `240V`, `480V` (커스텀 입력 지원)
  - Conductor Material: `Copper(구리)` vs `Aluminum(알루미늄)`
  - Current Load: `Amps (A)`
  - One-way Distance: 숫자 + 단위 (`meters` / `feet`)
  - Target Drop Limit: 허용 전압 강하율 (기본값 3%)
- **출력 (Outputs):**
  - Actual Voltage Drop: 볼트 단위 강하량 ($V$)
  - Percentage Drop: 백분율 ($V\%$)
  - Voltage at Load End: 부하단 수신 전압 ($V$)
  - Recommended Minimum Wire Size: 권장 최소 규격 (`AWG` 및 `mm²` 동시 표기)
  - Power Loss: 전선에서 소비되는 열 손실 전력 ($W$)

---

### 1.3 모터 토크 및 출력 변환 계산기 (Motor Torque & Power Calculator)

#### (1) 개요 및 공학적 배경
모터의 동역학적 성능 평가는 회전수(RPM), 토크(Torque), 기계적 출력(Mechanical Power) 간의 3대 요소가 기본축을 이룹니다. 미국 공학 단위(HP, lb-ft, in-lb)와 국제 표준 SI 단위(kW, N·m) 간의 단위 변환 실수가 산업 현장에서 매우 빈번하므로 양방향 전환이 완벽해야 합니다.

#### (2) 핵심 수식
- **SI 단위 체계 (Torque in $\text{N}\cdot\text{m}$, Power in $\text{W}$ / $\text{kW}$, $\omega$ in $\text{rad/s}$):**
  $$\omega = \frac{2\pi \times \text{RPM}}{60} \approx 0.10472 \times \text{RPM}$$
  $$P \text{ (W)} = T \text{ (N}\cdot\text{m)} \times \omega = \frac{T \times \text{RPM} \times 2\pi}{60}$$
  $$P \text{ (kW)} = \frac{T \text{ (N}\cdot\text{m)} \times \text{RPM}}{9549.3}$$
  $$T \text{ (N}\cdot\text{m)} = \frac{9549.3 \times P \text{ (kW)}}{\text{RPM}}$$

- **미국 관용 단위(Imperial System - HP, lb-ft):**
  $$P \text{ (HP)} = \frac{T \text{ (lb-ft)} \times \text{RPM}}{5252}$$
  $$T \text{ (lb-ft)} = \frac{5252 \times P \text{ (HP)}}{\text{RPM}}$$
  - 단위 환산: $1 \text{ HP} \approx 745.7 \text{ W} = 0.7457 \text{ kW}$
  - 토크 환산: $1 \text{ N}\cdot\text{m} \approx 0.73756 \text{ lb-ft} \approx 8.8507 \text{ in-lb}$

#### (3) 입출력 변수 스펙
- **계산 모드 선택 (Solve For):**
  1. Solve for Power (입력: RPM + Torque)
  2. Solve for Torque (입력: RPM + Power)
  3. Solve for Speed (입력: Power + Torque)
- **입출력 단위 실시간 토글 지원:**
  - Speed: `RPM`, `rad/s`
  - Torque: `N·m`, `kN·m`, `lb-ft`, `lb-in`, `kgf·m`
  - Power: `kW`, `W`, `HP (Mechanical)`

---

## 2. 기존 경쟁 사이트 벤치마킹 및 차별화 전략

### 2.1 경쟁 서비스 심층 분석

| 분석 항목 | Omni Calculator | RapidTables | 제안하는 신규 웹 허브 |
| :--- | :--- | :--- | :--- |
| **초기 로딩 속도** | 2.5~4.5초 (방대한 JS 번들, 애드서버 지연) | 1.0~1.8초 (구형 정적 HTML 구조) | **0.3~0.6초 미만 (초경량 정적 번들)** |
| **광고 배치 UX** | 계산기 중간/상단 삽입으로 입력창 침범 | 화면 양옆/하단 구형 배너 도배 | **Sticky Sidebar 및 하단 고정형 레이아웃** |
| **모바일 사용성** | 필드가 너무 많아 스크롤 피로도 심함 | 2000년대 웹 스타일, 핀치 줌 필요 | **엄지 조작 최적화 모바일 터치 슬라이더 UI** |
| **결과 즉시성** | 실시간 연산되나 로직 충돌 빈번 | 매번 'Calculate' 버튼 클릭 필요 | **입력 변경 즉시 (0ms) 반응형 실시간 렌더링** |
| **SEO 콘텐츠 품질** | 풍부한 설명문이나 지나치게 스크롤을 유도함 | 매우 빈약한 텍스트로 AdSense 단가 한계 | **계산기 최상단 배치 + 하단 지능형 FAQ/가이드** |

### 2.2 사용자 경험(UI/UX) 개선 방안

1. **상단 결과 가시성 (Above the Fold Rule):**
   - 모바일 및 데스크톱 모두 스크롤 없이 첫 화면에서 계산기와 즉시 결과 카드가 보이도록 컴팩트한 그리드 레이아웃 채택.
2. **슬라이더 + 정밀 숫자 입력 듀얼 바인딩:**
   - 대략적인 수치를 손가락으로 드래그할 수 있는 반응형 슬라이더와, 소수점 단위까지 기입할 수 있는 `<input type="number">`를 동기화.
3. **단위 인라인 즉시 스위칭:**
   - 페이지를 새로고침하거나 드롭다운을 여러 번 누르지 않고, 필드 바로 옆 배지 버튼 클릭 한 번으로 `Metric ↔ Imperial` 전환.
4. **시각적 데이터 시각화:**
   - 전압 강하율에 따라 녹색(안전 < 3%), 주황색(주의 3~5%), 적색(경고 > 5%) 게이지 바를 SVG로 실시간 표현.

### 2.3 구글 SEO 및 애드센스 단가 극대화 전략

1. **Schema.org 구조화 데이터 마크업:**
   - `SoftwareApplication` 또는 `WebApplication` 스키마를 JSON-LD로 포함하여 Google 검색 결과에 풍부한 스니펫(Rich Snippets) 노출 유도.
   - `FAQPage` 스키마를 동시 적용하여 검색 결과창에서 질문-답변 아코디언이 검색 리스팅을 직접 차지하도록 구축.
2. **전기·공학 고단가 키워드(High CPC) 타깃팅:**
   - B2B 성격의 키워드(예: "industrial cable sizing standard", "lead-acid Peukert exponent calculator", "NEMA motor torque rating")를 자연스럽게 본문 가이드라인 및 FAQ에 배치하여 미국/유럽 타깃 eCPM $5 ~ $20+ 공략.
3. **계산 예시 테이블(Worked Examples) 포함:**
   - "How to calculate battery runtime for a 100Ah battery running a 100W TV"와 같은 실제 시나리오별 풀이 과정을 텍스트로 제공하여 롱테일(Long-tail) 질의 트래픽을 대량 흡수.

---

## 3. 최적의 기술 스택 선정 및 아키텍처 비교

### 3.1 기술 스택 비교 분석

| 스택 후보 | 빌드 결과물 크기 | First Contentful Paint | 유지보수 복잡도 | 무료 호스팅 친화도 | 종합 평가 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Astro + Tailwind CSS** | **< 15KB (JS 제로 가능)** | **~0.2초** | 낮음 (컴포넌트 기반) | 최상 (Cloudflare / Vercel) | **★ 1위 (강력 추천)** |
| **Vite + Vanilla TS + Tailwind** | ~20KB | ~0.3초 | 보통 (상태관리 직접 구현) | 최상 | 2위 (매우 적합) |
| **Next.js (SSG) + Tailwind** | ~80~120KB | ~0.8초 | 높음 (오버엔지니어링 가능성) | 상 | 3위 (계산기엔 무거움) |
| **Nuxt / SvelteKit (SSG)** | ~40~60KB | ~0.5초 | 보통 | 상 | 4위 |

### 3.2 최종 추천 아키텍처: Astro + Tailwind CSS (또는 Vite + Vanilla TS)

#### 선정 이유
1. **Zero-JS by Default (Astro Islands 아키텍처):**
   - 상단의 계산기 영역만 인터랙티브 컴포넌트로 동작하고, 하단의 대규모 SEO 텍스트/FAQ/수식 설명은 순수 정적 HTML로 렌더링되어 브라우저 파싱 시간이 사실상 0에 수렴.
2. **서버 유지비 0원 ($0 Infrastructure):**
   - Cloudflare Pages 또는 Vercel의 무료 플랜(Free Tier)을 활용하여 전 세계 Edge CDN을 통한 무료 무제한 트래픽 대응 가능.
   - Cloudflare Pages는 월간 대역폭 및 요청 수 제한이 실질적으로 무제한이므로 트래픽 폭증에도 완벽 대응.
3. **애드센스 친화적 Core Web Vitals:**
   - LCP(Largest Contentful Paint) < 0.5s, CLS(Cumulative Layout Shift) = 0을 달성하여 Google 검색 랭킹 알고리즘에서 최고 등급의 페이지 경험 점수 획득.

---

## 4. 2단계(Phase 2) 구현 로드맵

1. **프로젝트 템플릿 세팅:**
   - Vite + TypeScript 또는 Astro 기반 미니멀 보일러플레이트 구성.
   - Tailwind CSS 기반 모바일 퍼스트 레이아웃 및 다크 모드 지원 스타일링.
2. **코어 연산 엔진 모듈화 (`/src/core/`):**
   - `battery.ts`, `voltagedrop.ts`, `motor.ts`로 수학적 계산 로직을 순수 함수(Pure Functions)로 분리하고 단위 테스트 가능한 구조 확립.
3. **인터랙티브 컴포넌트 개발:**
   - 양방향 슬라이더, 단위 전환 토글, 실시간 유효성 검사, 상태 결과 게이지 구현.
4. **SEO 및 애드센스 슬롯 최적화:**
   - 각 계산기별 OpenGraph 태그, JSON-LD 구조화 데이터, CLS를 유발하지 않는 고정형 AdSense 컨테이너 설계.
