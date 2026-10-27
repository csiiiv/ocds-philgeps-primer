# PhilGEPS–OCDS Field-Level Mapping Workshop

**Date:** October 27, 2026  
**Time:** 11:00 AM – 5:00 PM  
**Participants:** PhilGEPS, eBiz, WeSolve, and OCP

## Workshop Objective

Establish a shared understanding of the Open Contracting Data Standard (OCDS), introduce field-level and codelist mapping, conduct initial mapping exercises, and agree on a practical approach to completing the mappings.

## Workshop Agenda

| Time | Activity | Duration |
|---|---|---|
| 11:00–11:20 AM | Introductions & Alignment | 20 minutes |
| 11:20 AM–12:00 PM | OCDS Refresher | 40 minutes |
| 12:00–12:30 PM | Introduction to Field-Level Mapping | 30 minutes |
| 12:30–1:30 PM | Lunch Break | 60 minutes |
| 1:30–2:15 PM | Understanding the PhilGEPS Data Structure | 45 minutes |
| 2:15–3:15 PM | Hands-on Field-Level Mapping | 60 minutes |
| 3:15–3:30 PM | Short Break | 15 minutes |
| 3:30–4:15 PM | Codelist Mapping & Open Issues | 45 minutes |
| 4:15–4:45 PM | Workplan & Responsibilities | 30 minutes |
| 4:45–5:00 PM | Recap & Next Steps | 15 minutes |

---

## 1. Introductions & Alignment

**Time:** 11:00–11:20 AM (20 minutes)

### Discussion Points

- Introduce participants from PhilGEPS, eBiz, WeSolve, and OCP.
- Briefly discuss the current OCDS implementation status and previous work.
- Present the workshop objectives, activities, and expected outputs.
- Identify key technical counterparts and their responsibilities.

**Expected Output:** Shared objectives and identified team members.

## 2. OCDS Refresher

**Time:** 11:20 AM–12:00 PM (40 minutes)

### Discussion Points

- What is OCDS, and why is PhilGEPS implementing it?
- Overview of the contracting lifecycle: planning, tender, award, contract, and implementation.
- Introduction to the OCDS data structure:
  - Open Contracting Identifiers (OCIDs)
  - Releases and records
  - Release identifiers and tags
  - Related contracting processes
- Walk through a simplified OCDS JSON example and its relationship to PhilGEPS data.

**Expected Output:** Common understanding of OCDS concepts and data structures.

## 3. Introduction to Field-Level Mapping

**Time:** 12:00–12:30 PM (30 minutes)

### Discussion Points

- What is field-level mapping, and why is it necessary?
- Introduce the existing PhilGEPS mapping worksheets.
- Demonstrate how source database fields correspond to OCDS fields.
- Explain common mapping classifications:
  - Direct mappings
  - Derived values
  - Transformations
  - Missing fields and mapping gaps
- Briefly introduce codelist mapping and its relationship to field-level mapping.

**Expected Output:** Participants understand how to use the mapping worksheets and approach individual mappings.

### Lunch Break

**Time:** 12:30–1:30 PM

## 4. Understanding the PhilGEPS Data Structure

**Time:** 1:30–2:15 PM (45 minutes)

### Discussion Points

- PhilGEPS/eBiz presents the existing and proposed database structure.
- Identify relevant tables, fields, relationships, and identifiers.
- Discuss differences between legacy PhilGEPS, mPhilGEPS, and PhilGEPS 2027.
- Identify available technical documentation, data dictionaries, and sample datasets.
- Clarify which data is available, missing, or requires further investigation.
- Discuss whether historical changes and procurement events are captured in the existing system.

**Expected Output:** Initial understanding of source data and identification of the appropriate schema for mapping.

## 5. Hands-on Field-Level Mapping

**Time:** 2:15–3:15 PM (60 minutes)

### Discussion Points

- Select a manageable set of actual PhilGEPS fields, preferably from one procurement record.
- Jointly identify the corresponding OCDS fields and objects.
- Discuss field meanings, data types, identifiers, and relationships.
- Document required transformations, assumptions, and missing data.
- Review the completed sample mappings and identify areas requiring OCP guidance.

**Expected Output:** Initial completed field-level mappings and documented technical questions.

### Short Break

**Time:** 3:15–3:30 PM

## 6. Codelist Mapping & Open Issues

**Time:** 3:30–4:15 PM (45 minutes)

### Discussion Points

- Explain OCDS standard codelists and Philippine-specific values.
- Introduce the existing codelist mapping worksheet.
- Walk through procurement methods and other available source codes.
- Identify values that:
  - Map directly to OCDS
  - Require interpretation or transformation
  - May require local extensions
- Consolidate unresolved field-level and codelist mapping issues.

**Expected Output:** Initial codelist mapping examples and a consolidated list of gaps and clarification requests.

## 7. Workplan & Responsibilities

**Time:** 4:15–4:45 PM (30 minutes)

### Discussion Points

- Agree on the overall mapping approach and prioritization of fields or modules.
- Define responsibilities among PhilGEPS, eBiz, WeSolve, and OCP.
- Establish the mapping, technical clarification, review, and revision process.
- Agree on communication channels, working arrangements, and documentation.
- Review the existing October 31 mapping deadline and establish realistic milestones.
- Identify dependencies, blockers, and necessary technical resources.

**Expected Output:** Agreed workflow, designated owners, and updated implementation timeline.

## 8. Recap & Next Steps

**Time:** 4:45–5:00 PM (15 minutes)

### Discussion Points

- Summarize the workshop's key findings and decisions.
- Review sample mappings and issues identified.
- Confirm immediate deliverables, owners, and due dates.
- Schedule the next co-working or review session.

**Expected Output:** Clear action items and agreed next steps.

---

## Overall Workshop Deliverables

By the end of the workshop, the team aims to have:

1. A common understanding of OCDS and mapping requirements.
2. Identified PhilGEPS/eBiz technical counterparts.
3. Initial field-level and codelist mapping examples.
4. A documented list of technical gaps, assumptions, and questions.
5. An agreed mapping workflow, responsibilities, and implementation timeline.

## Recommended Preparation

The following materials should be available during the workshop:

- Existing PhilGEPS 1.5 and mPhilGEPS field-level mapping worksheets.
- OCDS codelist mapping template.
- PhilGEPS 2027 database schema or data dictionary, if available.
- A small sample of actual PhilGEPS procurement records.
- Shared worksheet or issue tracker for documenting mapping gaps and decisions.

## Facilitation Notes

The workshop is intended as an **orientation, technical alignment, and initial co-working session**, rather than an exercise to complete the entire mapping.

The morning should focus on building a common understanding of OCDS and introducing the mapping methodology.

The afternoon should emphasize hands-on collaboration, allowing PhilGEPS/eBiz developers to demonstrate their source data and work through real mappings with guidance from WeSolve and OCP.

**The primary measure of success is establishing a repeatable mapping and review process that the team can continue after the workshop.**