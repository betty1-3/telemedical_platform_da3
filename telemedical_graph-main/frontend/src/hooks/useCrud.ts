import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { Row } from '../types/entities';
import type { CrudResource } from '../utils/api/crud';
import { ApiError } from '../utils/api/client';

function writeMessage(error: unknown, subject: string, verb: string): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'Unable to reach the server. Check that the backend is running.';
    if (error.status === 404 || error.status === 405) return `The backend does not support ${verb} ${subject} at this route yet.`;
    if (error.status === 400 || error.status === 422) return error.message || 'The server rejected these values. Please review the form.';
    if (error.status === 409) return `This ${subject} is referenced by other records and could not be ${verb === 'deleting' ? 'deleted' : 'saved'}.`;
  }
  return `Unable to ${verb === 'deleting' ? 'delete' : 'save'} the ${subject}. Please try again.`;
}

/** Shared write-path behaviour: submitting state, toasts and data refresh. */
export function useCrud(resource: CrudResource, subject: string, onChanged: () => void) {
  const [submitting, setSubmitting] = useState(false);

  const save = useCallback(
    async (arg1: string | null | Row, arg2?: Row | string | null): Promise<boolean> => {
      setSubmitting(true);
      let id: string | null = null;
      let body: Row;
      if (typeof arg1 === 'object' && arg1 !== null) {
        body = arg1 as Row;
        id = (typeof arg2 === 'string' && arg2) ? arg2 : null;
      } else {
        id = (typeof arg1 === 'string' && arg1) ? arg1 : null;
        body = (arg2 && typeof arg2 === 'object') ? (arg2 as Row) : {};
      }
      try {
        if (id) await resource.update(id, body);
        else await resource.create(body);
        toast.success(id ? `${subject[0].toUpperCase()}${subject.slice(1)} updated` : `${subject[0].toUpperCase()}${subject.slice(1)} created`);
        onChanged();
        return true;
      } catch (error) {
        toast.error(writeMessage(error, subject, 'saving'));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [resource, subject, onChanged]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setSubmitting(true);
      try {
        await resource.remove(id);
        toast.success(`${subject[0].toUpperCase()}${subject.slice(1)} deleted`);
        onChanged();
        return true;
      } catch (error) {
        toast.error(writeMessage(error, subject, 'deleting'));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [resource, subject, onChanged]
  );

  return { submitting, save, remove };
}
