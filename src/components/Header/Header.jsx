import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/20/solid'
import mwrastifwtiaimage from '../../assets/images/mwrastifwtia.png'
import mwrastifwtiabandimage from '../../assets/images/MwraStifwtiaBand.webp'
import { Button } from "@/components/ui/button"
import InfoBand from "../InfoBand/InfoBand"
import { BandData } from "../../Data/BandData"
import { useState } from 'react'
import EkdiloseisNew from "../Ekdiloseis/EkdiloseisNew"
import MerchStore from "../MerchStore/MerchStore"

export default function Header() {
    const [selectedButton, setSelectedButton] = useState('Πληροφορίες')

    function handleSelectedButton(selectedButton) {
        setSelectedButton(selectedButton)
    }
  return (
    <>
      {BandData.map((items) => (
    <div key={items.id}>
      <img alt="" src={mwrastifwtiabandimage} className="h-32 w-full object-cover lg:h-40 rounded-xl" />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
          <div className="flex justify-center ">
            <img alt="" src={mwrastifwtiaimage} className="size-24 rounded-full ring-4 ring-white sm:size-32" />
            <div className="flex justify-start ml-6 flex-col items-center mt-12 min-w-0 flex-1 sm:hidden md:block">
              <h1 className="truncate text-2xl font-bold text-gray-900">{items.name}</h1>
              <p className="truncate text-sm text-gray-500">{items.description}</p>
            </div>

          </div>
          <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="flex justify-center items-end gap-4">
                <Button variant="outline" onClick={() => handleSelectedButton('Πληροφορίες')}>Πληροφορίες</Button>
                <Button variant="outline" onClick={() => handleSelectedButton('Εκδηλώσεις')}>Εκδηλώσεις</Button>
                <Button variant="outline" onClick={() => handleSelectedButton('Merch Store')}>Merch Store</Button>
            </div>
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                {selectedButton === 'Πληροφορίες' ? <InfoBand /> : null  }
                {selectedButton === 'Εκδηλώσεις' ? <EkdiloseisNew /> : null }
                {selectedButton === 'Merch Store' ? <MerchStore /> : null }
            </div>

            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
              >
                <EnvelopeIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-gray-400" />
                <span>Message</span>
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50"
              >
                <PhoneIcon aria-hidden="true" className="mr-1.5 -ml-0.5 size-5 text-gray-400" />
                <span>Call</span>
              </button>
            </div>


          </div>
        </div>
      </div>
      <section>


      </section>
    </div>
      ))}
    </>
  )
}
