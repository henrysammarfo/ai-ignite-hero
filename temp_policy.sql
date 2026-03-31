drop policy if exists "Public read reconciliation_log" on public.reconciliation_log;
create policy "Public read reconciliation_log" on public.reconciliation_log for select using (true);
drop policy if exists "Public read transactions" on public.transactions;
create policy "Public read transactions" on public.transactions for select using (true);
