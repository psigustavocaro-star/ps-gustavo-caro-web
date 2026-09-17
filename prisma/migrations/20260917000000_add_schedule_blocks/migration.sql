CREATE TABLE "ScheduleBlock" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "endTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScheduleBlock_date_idx" ON "ScheduleBlock"("date");
