---
status: Draft
owner: unassigned
updated_at: 2026-10-31
depth: medium
---

# Idea brief — focus-steps

## 1. Raw idea

# Focus Steps — короткий бриф

**Ідея:** Гейміфікований Pomodoro-таймер, який допомагає користувачеві рухатися до особистих цілей невеликими кроками.

**Концепція:** Користувач створює мету (наприклад, вивчити Java або прочитати книгу), розбиває її на етапи та просувається до неї за допомогою Pomodoro-сесій. Кожна завершена сесія додає нову сходинку на візуальному шляху до мети.

**Основні можливості:**
- Налаштування робочих інтервалів і перерв.
- Створення цілей та етапів їх досягнення.
- Візуалізація прогресу у вигляді сходинок.
- Облік завершених фокус-сесій та витраченого часу.
- Система досягнень і мотиваційних нагород.

**Цінність продукту:** Допомогти перетворити великі цілі на маленькі досяжні кроки, підтримувати мотивацію та бачити реальний прогрес.

**Slug:** `focus-steps`

## 2. Problem

No observed incident. The owner stated they have no confirmed case from a real person and will not invent one or present a hypothetical as an observation. Class: owner-reported, 2026-10-31.

Accepted hypothesis, for later verification, not as a fact: a person has a large long-term goal but finds it hard to spend time on it regularly and to see tangible progress. Class: owner-reported hypothesis. The examples in §1 (learn Java, read a book) stay illustrations, not incidents.

Current practice, owner-reported 2026-10-31: no focus app. Study tasks go in a paper notebook as a list of everything to do. Examples the owner gave: "do all the homework", "watch lecture 1". Live lectures go on Google Calendar.

The owner judges the flat list weak and ineffective, and accepted three failures of that practice: it is hard to start and stay with the work; progress toward the goal is not visible; items are too large to close. Class: owner decision, 2026-10-31, reply "всі три". These are judgments, not counted misses, hours, or abandoned goals.

A second practice, owner-reported 2026-10-31: drawing stairs in the same notebook helps. The owner draws one stair, writes on it what they will do, works only on that without switching away, and marks it done when the session ends. They want the stair's name to be a smallest completed action, a completion, not an open pile of work. Class: owner-reported practice and preference. "It helps a lot" is their judgment, not a measured before/after. They did not say the stairs replaced the flat list.

Paper limit, owner-reported 2026-10-31: time is not tracked, and they cannot see progress on specific goals. They said they miss both. This is a felt gap, not a count of hours lost or goals abandoned.

No impact numbers were given. None of this is a counted incident.

## 3. Users

Accepted: the intended user is the idea owner. Class: owner decision, 2026-10-31. No name is on record, so the brief owner stays unassigned. This does not mean the owner reported a personal incident; they still declined to describe one.

Situation on record: the owner tracks their own study work (homework, lectures) in a notebook, draws one stair at a time for the work they will finish in that sitting, and puts live lectures on Google Calendar. This describes the owner, not a chosen segment of students. Other people are not the audience. The same person is the only operator on record, because nobody else was included.

## 4. Why now

No trigger established.

## 5. Out of scope

Accepted exclusions for the first version, owner decision 2026-10-31, option "Час і сходинки по цілі":

- Achievements and motivational rewards.
- Settings for work-interval length and breaks.
- A finish line on a goal: stages, or a numeric target such as a required number of hours or stairs.
- Moving live lectures out of Google Calendar. Live lectures stay where they are.

No technology constraint is agreed. Where the history is stored, and whether there is an account, is not decided.

## 6. Risks

Weakest consequential assumption: the felt gap is large enough that the owner will keep using the specified version. There is still no count of hours or abandoned goals. "I really miss this" is owner-reported, not a measured loss. Choosing to specify rejects writing the goal name and the minutes on the paper stair; that rejection is a decision, not evidence the app will be kept. Class: assumption. Origin: owner reports plus the specify choice, 2026-10-31.

The flat-list failures (starting, staying, oversized items) stay judgments. The first version keeps the stair rules and adds time and a goal name. It does not include a finish line, so a goal shows accumulated time and finished stairs, not distance remaining. The owner accepted that tradeoff.

Reversibility: the paper stairs stay either way. Dropping the spec returns to today's practice. Nothing is deployed. Operational owner: the idea owner, the only user. Storage and accounts are not chosen, so no data-exposure decision is accepted. No independent critique: there is no accepted account, sharing, or public contract, and the owner did not ask for a stress test.

| Claim / question | Class | Source / origin | Finding / limit |
|---|---|---|---|
| §1 is the product concept the owner wants examined | owner-reported | Owner message, 2026-10-31 | Concept, feature list, and hoped-for value. No numbers. |
| No confirmed case from a real person; do not invent one | owner-reported | Owner message, 2026-10-31 | Explicit absence of an observation. Not a measured frequency of zero. |
| Hypothesis: a large long-term goal, irregular time, progress that is hard to see | owner-reported | Owner message, 2026-10-31 | Stated as a hypothesis for later verification. Not an incident. |
| No focus app; notebook list for study tasks; Google Calendar for live lectures | owner-reported | Owner message, 2026-10-31 | Current practice. Examples: "do all the homework", "watch lecture 1". Not a log of missed work. |
| The notebook system is weak and ineffective | owner-reported | Owner message, 2026-10-31 | Owner's judgment. No count of unfinished items, abandoned goals, or hours. |
| Three failures: hard to start and stay; progress toward the goal is not visible; items are too large | owner-reported | Owner reply "всі три", 2026-10-31 | Accepted account of the flat list. Not a measured frequency. Does not by itself accept achievements or a new app. |
| Drawing one stair, labeling the work, staying on it, marking it done, helps a lot. The name should be a smallest completed action | owner-reported | Owner message, 2026-10-31 | Existing practice and a preference for the label. Not a measured gain. This message did not answer the earlier trial-vs-specify prompt. |
| Paper does not track time, and progress on specific goals is not visible; the owner misses both | owner-reported | Owner message, 2026-10-31 | Felt gap. No hours and no goal count. |
| First version is time on a stair plus finished stairs under a goal name. Achievements, interval and break settings, a finish line, and moving live lectures are out | owner-reported | Owner choice, 2026-10-31, option "Час і сходинки по цілі" | Scope decision. Storage and accounts were not in the option. |
| Specify that first version; do not stay on paper | owner-reported | Owner choice, 2026-10-31, option "Специфікувати цю версію" | Accepts a spec. Does not measure the gap. Does not accept a storage design. |
| Intended user is the idea owner | owner-reported | Owner choice, 2026-10-31, option "Це для мене" | Audience decision. Not evidence that the hypothesis is true for them. |
| This checkout has no existing product to extend | source-verified | Git root `C:/D/guru/ai-guru/2026.10.31_agenticengineering`, `git status` on 2026-10-31: branch `main`, no `docs/` directory before this brief | Nothing local to reuse. Limit: root status and absence of `docs/` only; not a full survey. |

No external research. No independent critique. Owner confirmation of the hypothesis does not make its factual premises source-verified.

## 7. Recommendation

Accepted so far: no observed incident. The intended user is the idea owner. Current practice is a notebook task list plus Google Calendar for live lectures, and no focus app. The owner accepts three failures of that practice: starting and staying, invisible progress toward the goal, and items that are too large. Class: owner decisions and reports, 2026-10-31.

Accepted direction for a first version, owner decision 2026-10-31: keep the paper stair's rules — one stair at a time, the name is a smallest completed action, work stays on that stair, mark it done at the end — and add elapsed time on that stair. Stairs belong to a named goal. Progress on that goal is the time spent and the finished stairs under it. The intended result the owner can see: for a chosen goal, the finished stairs and the time on them.

Accepted exclusions are in §5. The earlier notebook trial (start drawing stairs) was not accepted and stays withdrawn.

Accepted next step, owner decision 2026-10-31, option "Специфікувати цю версію": write a spec for this first version. Rejected alternative: keep paper and write the goal name and the minutes on the stair. Major tradeoff: progress is accumulated time and finished stairs, not distance remaining.

Outcome: ready-for-specify

No blocking unknown remains. Storage and accounts stay undecided and out of this acceptance. Next action: specify `focus-steps` from this brief. Strongest evidence: the owner's own stair practice and the two paper limits they named. Weakest assumption: that felt gap is enough to keep using the result, with no counted baseline.

## 8. Open questions

| Unknown | Consequence | Blocking | Verification | Owner |
|---|---|---|---|---|
| Where the history is stored, and whether an account exists | A later stage can choose. It does not change the problem or the accepted scope. An account would be a new data decision and is not accepted here | nonblocking | Leave to design unless the owner requires it before a spec | unassigned |
