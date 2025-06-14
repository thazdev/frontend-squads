import { Listbox, Popover, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { FiFilter } from "react-icons/fi";

type Squad = { id: string; name: string };
type Collaborator = { id: string; name: string };

interface Props {
  squads: Squad[];
  collaborators: Collaborator[];
  squadId: string;
  responsibleId: string;
  onChange: (vals: { squadId: string; responsibleId: string }) => void;
}

export default function TaskFilter({
  squads,
  collaborators,
  squadId,
  responsibleId,
  onChange,
}: Props) {
  const [localSquad, setLocalSquad] = useState(squadId);
  const [localResp, setLocalResp] = useState(responsibleId);

  function reset() {
    setLocalSquad("");
    setLocalResp("");
  }

  function apply() {
    onChange({ squadId: localSquad, responsibleId: localResp });
  }

  return (
    <Popover className="relative">
      <Popover.Button className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 shadow">
        <FiFilter className="text-lg" />
        Filtrar
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 z-50 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">
              Squad
            </label>
            <Listbox value={localSquad} onChange={setLocalSquad}>
              <div className="relative">
                <Listbox.Button className="w-full border border-gray-400 rounded px-3 py-1.5 text-left text-sm">
                  {localSquad
                    ? squads.find((s) => s.id === localSquad)?.name
                    : "Todos"}
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-400 rounded shadow">
                    <Listbox.Option
                      key="all"
                      value=""
                      className="cursor-pointer px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Todos
                    </Listbox.Option>
                    {squads.map((s) => (
                      <Listbox.Option
                        key={s.id}
                        value={s.id}
                        className="cursor-pointer px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        {s.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* RESPONSÁVEL */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600">
              Responsável
            </label>
            <Listbox value={localResp} onChange={setLocalResp}>
              <div className="relative">
                <Listbox.Button className="w-full border border-gray-400 rounded px-3 py-1.5 text-left text-sm">
                  {localResp
                    ? collaborators.find((c) => c.id === localResp)?.name
                    : "Todos"}
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-400 rounded shadow">
                    <Listbox.Option
                      key="all"
                      value=""
                      className="cursor-pointer px-3 py-1 text-sm hover:bg-gray-100"
                    >
                      Todos
                    </Listbox.Option>
                    {collaborators.map((c) => (
                      <Listbox.Option
                        key={c.id}
                        value={c.id}
                        className="cursor-pointer px-3 py-1 text-sm hover:bg-gray-100"
                      >
                        {c.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-1">
            <button
              onClick={reset}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Limpar
            </button>
            <button
              onClick={apply}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
            >
              Aplicar
            </button>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
