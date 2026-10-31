---
status: Draft
owner: unassigned
reviewers: []
updated_at: 2026-10-31
feature_size: M
---

# Spec — focus-steps

> **Glossary:** [CONTEXT](./CONTEXT.md)
> **Reference module / docs / channels used:** `docs/idea-brief.md`, `docs/architecture-map.md`, `docs/roadmap.md`. No extra code scan.

## 1. Context

The only user is the idea owner. They keep study work in a paper notebook: a flat list such as "do all the homework", and stairs they draw one at a time. A drawn stair helps them stay on one smallest completed action. The list does not. Paper does not record how long a stair took, and it does not show progress on a named goal. That gap is the owner's report. There is no counted loss of hours. Source: `docs/idea-brief.md` §2, §3, §7.

No trigger or deadline is established (`docs/idea-brief.md` §4).

The committed approach is the accepted first version. The owner opens one stair, names it as a smallest completed action, and names the goal in the same step. A new goal name creates the goal only when the stair actually opens. The same name means the same characters after spaces at the ends are ignored. Capital letters and small letters are different characters, so they do not join. That name joins the existing goal and does not create a second one. A name that is empty, including one made only of spaces, creates neither a goal nor a stair. The product does not judge whether the words are a smallest completed action. It requires a non-empty name and says in plain language that the name has to be a completed action. A refused second stair creates neither a goal nor a stair. Time runs while that stair is open and the Owner can see the app, and stops when they mark it done. Closing the last view of the app, a crash, or a power loss means the app is no longer open. The stair stays open, the time while it was not visible is not counted, and several views of the app count that time once. Time runs again when the Owner can see the app. A second stair cannot be opened until this one is marked done, and the product says so in plain language. After that, they can correct the name and the time, and the goal's total uses the corrected time. While a stair is open, the owner sees its name, its goal, and the time counted so far, and marks it done from there. Several views show that same time. The owner also sees the names of their goals and opens one by choosing its name. Two stairs under one goal may share a name. They stay two stairs, and each stair's time is in the goal's total. Progress on a goal is the finished stairs under it and the total time on them. A forgotten open stair, and a clock change while the Owner can see the app, are an accepted risk: the owner marks it done and corrects the time. Competitive comparison was not run; the direction and the exclusions were already accepted. The sharpest failure raised against this approach is the forgotten open stair, and the owner kept the close-and-correct behavior.

Traceability: `docs/idea-brief.md` §5 and §7. The owner confirmed, in this specification pass, the running clock, the single open stair, correction after done, close-and-correct for a stair left open, that time counts only while the Owner can see the app, that a crash or a power loss counts as the app no longer being open, and that a goal appears when it is named while opening a stair. A finished stair stays on that goal; this version does not move it to another goal.

## 2. Goals

- The owner can see, for a chosen goal, the finished stairs and the total time on them.
- The owner works one open stair at a time. The recorded time is the time the stair was open while the Owner could see the app, after any correction. Time while the app was not visible is not included. Several views count that time once.
- A correction to a finished stair's name or time changes what that goal shows.

## 3. Non-goals

- Achievements and motivational rewards — excluded in `docs/idea-brief.md` §5. They were not the gap the owner named.
- Settings for how long work or a break should last — same exclusion. Time is whatever the open stair actually ran, not a chosen length.
- A finish line on a goal, whether stages or a numeric target — same exclusion. Progress is accumulated time and finished stairs, not distance remaining.
- Moving live lectures out of the owner's existing calendar — same exclusion.
- An account or a copy of the history on another computer — the owner accepted a single-person tool with no account.
- Moving a finished stair onto a different goal — the owner chose to keep each stair on the goal it was opened under. A wrong goal name stays with that stair in this version.
- Removing a finished stair or a goal — the owner chose correction of the name and the time instead. The stair stays in the goal's list.
- Stopping the clock because the owner stepped away while they can still see the app — they chose to mark the stair done and correct the time instead. Closing the last view, a crash, or a power loss is different: the open stair stays open, and the time it was not visible is not counted.

## 4. User stories

### US-01: Open one stair

**As a** Owner
**I want** to open one stair under a goal
**So that** time starts and I stay on that action

### US-02: Mark the stair done

**As a** Owner
**I want** to mark the open stair done
**So that** time stops and the stair counts toward its goal

### US-03: See a goal's progress

**As a** Owner
**I want** to open a goal and see its finished stairs and total time
**So that** progress is visible

### US-04: Correct a finished stair

**As a** Owner
**I want** to change the name or the time of a finished stair
**So that** the goal total shows the correction, not the mistake

### US-05: Hear why a second stair is refused

**As a** Owner
**I want** a plain explanation when a second stair will not open
**So that** I know the current stair must be marked done first

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Owner has a goal and no stair is open
**When** the Owner opens a stair under that goal and names it as a completed action
**Then** time starts on that stair and it is the only open stair

### AC-02 (US-02) — happy path

**Given** the Owner has an open stair
**When** the Owner marks that stair done
**Then** time stops, and the stair appears among that goal's finished stairs with the time it ran

### AC-03 (US-03) — happy path

**Given** a goal has finished stairs with time
**When** the Owner opens that goal
**Then** the Owner sees each finished stair and the total time on them

### AC-04 (US-01) — error

**Given** the Owner has a goal and no stair is open
**When** the Owner tries to open a stair with a name that is empty, including a name made only of spaces
**Then** no stair is created, time does not start, and the Owner is told in plain language that the name has to be a completed action

### AC-05 (US-03) — authorization

**Given** the Owner has goals and stairs on this computer
**When** someone tries to see or change them from another computer
**Then** that person is not shown the Owner's goals or stairs and cannot change them. A person at this computer can see the notes, because there is no separate login

### AC-06 (US-05) — domain invariant

**Given** the Owner already has one stair open
**When** the Owner tries to open a second stair
**Then** the second stair is not created, no goal is created, the first stays open, and the Owner is told in plain language to mark the current stair done first

### AC-07 (US-04) — cross-context

**Given** a finished stair's time is part of its goal's total
**When** the Owner changes that stair's time or name
**Then** the stair shows the new time or name, and the goal's total uses the new time

### AC-08 (US-01) — cross-context

**Given** the Owner has one stair open and time has been running
**When** the Owner closes the last view of the app, or the app ends in a crash or a power loss, and then opens it again on the same computer
**Then** that stair is still the only open stair, the time while the app was not visible is not counted, several views would have counted that time once, and time runs again now that the Owner can see the app

### AC-09 (US-01) — happy path

**Given** the Owner has no goal with the name they are about to use, and no stair is open
**When** the Owner opens a stair, names it as a completed action, and gives the goal a name
**Then** that goal exists, the stair is open under it, and time starts

### AC-10 (US-01) — error

**Given** no stair is open
**When** the Owner tries to open a stair with a goal name that is empty, including a name made only of spaces
**Then** no goal is created, no stair is created, time does not start, and the Owner is told in plain language that the goal needs a name

### AC-11 (US-01) — domain invariant

**Given** the Owner already has a goal with a name, and no stair is open
**When** the Owner opens a stair and uses that same goal name: the same characters after spaces at the ends are ignored, and capital letters differ from small letters
**Then** the stair opens under the existing goal, and a second goal with that name is not created

### AC-12 (US-03) — happy path

**Given** a goal exists and its only stair is still open
**When** the Owner opens that goal
**Then** the Owner sees no finished stairs and a total of zero. The open stair is not in the finished list

### AC-13 (US-04) — error

**Given** a finished stair shows a time, and that time is part of its goal's total
**When** the Owner tries to change that time to empty or to less than zero
**Then** the change is not kept, the stair and the goal total stay as they were, and the Owner is told in plain language that the time has to be the time the stair ran

### AC-14 (US-04) — error

**Given** a finished stair has a name
**When** the Owner tries to change that name to empty, including a name made only of spaces
**Then** the change is not kept, the previous name stays, and the Owner is told in plain language that the name has to be a completed action

### AC-15 (US-01) — happy path

**Given** the Owner has one stair open
**When** the Owner looks at the app
**Then** the Owner sees that stair's name, its goal, and the time counted so far, and can mark it done from there. The stair is not in its goal's finished list. Several views show that same time

### AC-16 (US-03) — happy path

**Given** the Owner has one or more goals
**When** the Owner looks at the app
**Then** the Owner sees each goal's name and can open a goal by choosing that name

### AC-17 (US-03) — domain invariant

**Given** a goal has two finished stairs with the same name and different times
**When** the Owner opens that goal
**Then** the Owner sees both stairs, and the total uses both times

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Time to show a goal | ≤ 1 second from asking for that goal until the finished stairs and the total are visible | Timed check on the Owner's computer, using the goals and stairs present there at the time of the check. This version sets no separate upper count |
| Records survive restart | 100% of the goals and stairs are present after the last view is closed, or after a crash or a power loss, and the app is opened again on the same computer. An open stair stays open, and the gap adds 0 seconds to its span | Close the last view with a stair open, or end the app in a crash, open it, compare the list and the span |
| Time shown on a finished stair | Within 1 second of the time the stair was open while the Owner could see the app, or of the corrected time if the Owner changed it; the goal total uses that number. Several views count that time once | Compare the shown number with that span or the correction |

## 6.1 Security / privacy

- **Data classification:** confidential. Goal names, stair names, and time spent are the Owner's personal notes.
- **Personal data touched:** goal names, stair names, and the time on each stair. No account name and no separate login.
- **AuthZ/AuthN impact:** no login is added. Anyone at this computer can see the notes. That is the accepted consequence of having no account. Another person is not given a separate way in.
- **Abuse cases:**
  - Another person at the computer reads the notes. The product does not hide them, because there is no account.
  - A stair name is stored and shown as text the Owner typed. It is not run as a command.
  - Many stairs cannot be opened at once. A second open stair is refused until the current one is marked done.
- **Security review:** Required before design, because the feature size is M and the notes are personal.

## 7. Metrics / KPIs

- **Finished stairs with recorded time** — baseline: 0, target: at least 1 on some goal within 7 days of first use.
- **Goals whose total the Owner reads in the app** — baseline: 0, target: at least 1 within 14 days of first use.
- **Finished stairs in the second week** — baseline: 0, target: at least 1 finished stair with time during the second week after first use.

## 8. Open questions

None.
