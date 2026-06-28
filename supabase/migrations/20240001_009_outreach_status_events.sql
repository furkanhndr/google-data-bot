-- Migration: 009 — Outreach status change events
-- Run order: after 008_outreach.sql

ALTER TABLE public.outreach_events
  DROP CONSTRAINT IF EXISTS outreach_events_event_type_check;

ALTER TABLE public.outreach_events
  ADD CONSTRAINT outreach_events_event_type_check
  CHECK (event_type IN ('prepared', 'copied', 'opened', 'sent', 'failed', 'status_changed'));
