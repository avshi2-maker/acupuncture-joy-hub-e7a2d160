-- Allow admins to delete feedback
CREATE POLICY "Admins can delete feedback"
ON public.page_feedback
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);