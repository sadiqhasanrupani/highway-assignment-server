import { eq, inArray } from "drizzle-orm";
import { NextFunction } from "express";
import { UpdateClassroomSession } from "../types";
import { db } from "../config/db.config";
import { classroom_sessions } from "../schemas/schemas";
import { errorNext, errorValidator } from "../utils/error-handler";

export const updateClassroomSessionsBatch = async (
  classId: number,
  daysOfWeek: UpdateClassroomSession[],
  currentDate: Date,
  next: NextFunction,
) => {
  // Check if daysOfWeek is empty
  if (!daysOfWeek.length) {
    return errorNext({
      httpStatusCode: 400,
      message: "No sessions provided to update.",
      next,
    });
  }

  // Extract all session IDs from the input
  const sessionIds = daysOfWeek.map((dayOfWeek) => dayOfWeek.id);

  // Check for missing IDs in the array
  if (sessionIds.some((id) => id === undefined)) {
    return errorValidator({
      errorStack: [
        {
          msg: `Some session(s) are missing an 'id'.`,
          path: "daysOfWeek",
          type: "field",
          value: daysOfWeek,
          location: "body",
        },
      ],
      httpStatusCode: 422,
      next,
      isValidationErr: true,
    });
  }

  // Validate that all provided session IDs exist in the database
  const validClassSessions = await db
    .select({ id: classroom_sessions.id })
    .from(classroom_sessions)
    .where(inArray(classroom_sessions.id, sessionIds));

  const validSessionIds = new Set(validClassSessions.map((session) => session.id));

  // Identify any invalid session IDs
  const invalidSessions = daysOfWeek.filter((dayOfWeek) => !validSessionIds.has(dayOfWeek.id));

  if (invalidSessions.length > 0) {
    return errorValidator({
      errorStack: invalidSessions.map((session) => ({
        msg: `Classroom session id ${session.id} is invalid.`,
        path: "daysOfWeek",
        type: "field",
        value: session,
        location: "body",
      })),
      httpStatusCode: 422,
      next,
      isValidationErr: true,
    });
  }

  // Proceed with updating the classroom sessions
  try {
    const updatePromises = daysOfWeek.map((dayOfWeek) =>
      db
        .update(classroom_sessions)
        .set({
          classroom_id: classId,
          day_of_week: dayOfWeek.dayOfWeek,
          start_time: dayOfWeek.startTime,
          end_time: dayOfWeek.endTime,
          updated_at: currentDate,
        })
        .where(eq(classroom_sessions.id, dayOfWeek.id)),
    );

    const results = await Promise.all(updatePromises);

    const failedUpdates = results.filter((result) => result.rowCount === 0);

    if (failedUpdates.length > 0) {
      return errorNext({
        httpStatusCode: 400,
        message: "Something went wrong while updating classroom session data.",
        next,
      });
    }
  } catch (error) {
    return errorNext({
      httpStatusCode: 500,
      message: "An error occurred during the update process.",
      next,
    });
  }
};
