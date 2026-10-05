import React, { useMemo, useState } from 'react';
import {
  Check,
  FileText,
  Search,
  FileSearch,
} from 'lucide-react';

const initialActivities = [
  {
    _id: '6ac17354320b61ea33439595',
    userId: '6ac16743e9474635a153b63f',
    resumeId: '6ac16e3f6d63596166146205',
    typeOfHistory: 'resume',
    createdAt: '2026-10-06T10:30:00',
    updatedAt: '2026-10-06T10:30:00',
    __v: 0,
  },
  {
    _id: '6ac171755af0a1c190d1bb6a',
    userId: '6ac16743e9474635a153b63f',
    jobFinderId: '6ac171755af0a1c190d1bb5f',
    typeOfHistory: 'jobFinder',
    createdAt: '2026-10-05T16:15:00',
    updatedAt: '2026-10-05T16:15:00',
    __v: 0,
  },
  {
    _id: '6ac170725af0a1c190d1bb59',
    userId: '6ac16743e9474635a153b63f',
    jobDescriptionAnalysisId: '6ac170725af0a1c190d1bb4f',
    typeOfHistory: 'jobDescriptionAnalysis',
    createdAt: '2026-10-04T02:59:00',
    updatedAt: '2026-10-04T02:59:00',
    __v: 0,
  },
  {
    _id: '6ac16ff05af0a1c190d1bb49',
    userId: '6ac16743e9474635a153b63f',
    jobDescriptionAnalysisId: '6ac16ff05af0a1c190d1bb3a',
    typeOfHistory: 'jobDescriptionAnalysis',
    createdAt: '2026-10-03T21:13:20',
    updatedAt: '2026-10-03T21:13:20',
    __v: 0,
  },
  {
    _id: '6ac16f905af0a1c190d1bb34',
    userId: '6ac16743e9474635a153b63f',
    interviewId: '6ac16f905af0a1c190d1bb25',
    typeOfHistory: 'interview',
    createdAt: '2026-10-02T01:28:00',
    updatedAt: '2026-10-02T01:28:00',
    __v: 0,
  },
  {
    _id: '6ac16e3f1a8de6cb751e8528',
    userId: '6ac16743e9474635a153b63f',
    resumeId: '6ac16e3f6d63596166146205',
    typeOfHistory: 'resume',
    createdAt: '2026-09-28T14:10:00',
    updatedAt: '2026-09-28T14:10:00',
    __v: 0,
  },
  {
    _id: '6ac174d4f5d45aa123abcd77',
    userId: '6ac16743e9474635a153b63f',
    resumeId: '6ac16e3f6d63596166146205',
    typeOfHistory: 'resume',
    createdAt: '2026-10-06T10:30:00',
    updatedAt: '2026-10-06T10:30:00',
    __v: 0,
  },
   {
    _id: '6ac171755af0a1c190d1bb6a',
    userId: '6ac16743e9474635a153b63f',
    jobFinderId: '6ac171755af0a1c190d1bb5f',
    typeOfHistory: 'jobFinder',
    createdAt: '2026-10-05T16:15:00',
    updatedAt: '2026-10-05T16:15:00',
    __v: 0,
  },
  {
    _id: '6ac170725af0a1c190d1bb59',
    userId: '6ac16743e9474635a153b63f',
    jobDescriptionAnalysisId: '6ac170725af0a1c190d1bb4f',
    typeOfHistory: 'jobDescriptionAnalysis',
    createdAt: '2026-10-04T02:59:00',
    updatedAt: '2026-10-04T02:59:00',
    __v: 0,
  },
  {
    _id: '6ac16ff05af0a1c190d1bb49',
    userId: '6ac16743e9474635a153b63f',
    jobDescriptionAnalysisId: '6ac16ff05af0a1c190d1bb3a',
    typeOfHistory: 'jobDescriptionAnalysis',
    createdAt: '2026-10-03T21:13:20',
    updatedAt: '2026-10-03T21:13:20',
    __v: 0,
  },
  {
    _id: '6ac16f905af0a1c190d1bb34',
    userId: '6ac16743e9474635a153b63f',
    interviewId: '6ac16f905af0a1c190d1bb25',
    typeOfHistory: 'interview',
    createdAt: '2026-10-02T01:28:00',
    updatedAt: '2026-10-02T01:28:00',
    __v: 0,
  },
  {
    _id: '6ac170725af0a1c190d1bb59',
    userId: '6ac16743e9474635a153b63f',
    jobDescriptionAnalysisId: '6ac170725af0a1c190d1bb4f',
    typeOfHistory: 'jobDescriptionAnalysis',
    createdAt: '2026-10-04T02:59:00',
    updatedAt: '2026-10-04T02:59:00',
    __v: 0,
  }
];

const formatDate = (isoString) => {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - itemDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays >= 2 && diffDays <= 6) {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${weekday}, ${timeStr}`;
  }

  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month} ${day}, ${year}, ${timeStr}`;
};

const getActivityConfig = (type) => {
  switch (type) {
    case 'interview':
      return {
        title: 'Completed Technical Interview',
        icon: <Check className="w-4 h-4 text-black stroke-[3]" />,
        iconBg: 'bg-[#5eead4]',
        pillStyle: 'border-black',
      };
    case 'resume':
      return {
        title: 'Resume Analyzed',
        icon: <FileText className="w-4 h-4 text-black stroke-[2.5]" />,
        iconBg: 'bg-[#fde047]',
        pillStyle: 'border-black',
      };
    case 'jobFinder':
      return {
        title: 'Job Finder Search',
        icon: <Search className="w-4 h-4 text-black stroke-[2.5]" />,
        iconBg: 'bg-[#38bdf8]',
        pillStyle: 'border-black',
      };
    case 'jobDescriptionAnalysis':
      return {
        title: 'Job Description Analyzed',
        icon: <FileSearch className="w-4 h-4 text-black stroke-[2.5]" />,
        iconBg: 'bg-[#fb923c]',
        pillStyle: 'border-black',
      };
    default:
      return {
        title: 'Activity Logged',
        icon: <Check className="w-4 h-4 text-black stroke-[3]" />,
        iconBg: 'bg-gray-200',
        pillStyle: 'border-black',
      };
  }
};

export default function History() {
  const [activities, setActivities] = useState(initialActivities);

  const sortedActivities = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [activities]
  );

  return (
    <div className="min-h-screen w-full bg-transparent px-3 py-8 pt-32 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-[1180px] font-sans">
        <div className="space-y-3" style={{ marginTop: '2rem' }}>
          {sortedActivities.length === 0 ? (
            <div className="border-[3px] border-black bg-white p-8 text-center shadow-[4px_4px_0px_#000]">
              <p className="text-sm font-medium text-gray-500">No activities found.</p>
            </div>
          ) : (
            sortedActivities.map((activity) => {
              const config = getActivityConfig(activity.typeOfHistory);
              const formattedDate = formatDate(activity.createdAt);

              return (
                <div
                  key={activity._id}
                  className="group relative flex items-center justify-between overflow-hidden border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3.5 pl-4 py-3 pr-2">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-black ${config.iconBg} shadow-[2px_2px_0px_#000]`}
                    >
                      {config.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-extrabold tracking-tight text-gray-950 sm:text-lg">
                        {config.title}
                      </h3>
                    </div>
                  </div>

                  <div className="relative flex shrink-0 items-stretch self-stretch">
                    <div
                      className="flex items-center bg-[#c7b9f5] px-3 py-3 pl-8 pr-4 sm:px-4"
                      style={{
                        clipPath: 'polygon(18px 0%, 100% 0%, 100% 100%, 0% 100%)',
                      }}
                    >
                      <span className="mr-2 whitespace-nowrap text-xs font-bold text-black sm:text-sm">
                        {formattedDate}
                      </span>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
