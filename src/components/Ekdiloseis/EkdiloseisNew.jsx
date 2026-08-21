import { InformationCircleIcon, MapPinIcon } from '@heroicons/react/20/solid'
import Ticket from '../Ticket/Ticket'
import InfoGeneral from '../Info/InfoGeneral'

const people = [
  {
    name: 'Κυτταρο',
    title: '30 Χρονια Μωρα Στη Φωτια',
    role: 'Admin',
    date: '22/9',
    location: 'https://maps.app.goo.gl/oKyhUWNKBgb3fguK8',
    telephone: '+1-202-555-0170',
  },
  {
    name: 'Cody Fisher',
    title: 'Product Directives Officer',
    role: 'Admin',
    date: '5/10',
    email: 'codyfisher@example.com',
    telephone: '+1-202-555-0114',
  },
  {
    name: 'Esther Howard',
    title: 'Forward Response Developer',
    email: 'estherhoward@example.com',
    telephone: '+1-202-555-0143',
    role: 'Admin',
    date: '12/10',
  },
  {
    name: 'Jenny Wilson',
    title: 'Central Security Manager',
    role: 'Admin',
    date: '18/10',
    email: 'jennywilson@example.com',
    telephone: '+1-202-555-0184',
  },
  {
    name: 'Kristin Watson',
    title: 'Lead Implementation Liaison',
    role: 'Admin',
    date: '2/11',
    email: 'kristinwatson@example.com',
    telephone: '+1-202-555-0191',
  },
  {
    name: 'Cameron Williamson',
    title: 'Internal Applications Engineer',
    role: 'Admin',
    date: '20/11',
    email: 'cameronwilliamson@example.com',
    telephone: '+1-202-555-0108',
  },
]

function mapsUrl(person) {
  if (person.location?.startsWith('http')) {
    return person.location
  }

  const destination = person.location || person.name
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

export default function EkdiloseisNew() {
  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <li key={`${person.name}-${person.date}`} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gray-900 text-white">
              <span className="text-lg leading-none font-bold">{person.date}</span>
            </div>

            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">{person.name}</h3>
                <span className="inline-flex shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20">
                  {person.role}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">{person.title}</p>
            </div>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex min-w-0 flex-1">
                <Ticket />
              </div>
              <div className="-ml-px flex min-w-0 flex-1">
                <a
                  href={mapsUrl(person)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex w-full items-center justify-center gap-x-3 border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <MapPinIcon aria-hidden="true" className="size-5 text-gray-400" />
                  Location
                </a>
              </div>
              <div className="-ml-px flex min-w-0 flex-1">
                <InfoGeneral event={person} />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
