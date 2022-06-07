import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Toggle, mergeStyles } from '@fluentui/react';
import DataStyle, { Data, Datum } from 'data-style';
import DataLook from 'components/data-look';
import ControlHeader from 'components/control-header';
import PopUpSelect from 'components/pop-up-select';
import lineData from 'data-b';

const MODE = 'local'
const dataLookStyles = mergeStyles({
  selectors: {
    ' > div': {
      color: '#333',
    },
  },
});
const selectorStyles = mergeStyles(
  {
    fontSize: '1.1em',
    margin: '0 1.5em'
  }
)
const headerStyles = mergeStyles(
  {
    margin: '0 2em'
  }
)
const toggleStyles = {
  root: {
    margin: '0 30px 20px 0',
    maxWidth: '300px',
  },
};

// convert data in file to a format DataStyle will accept
const convertFromCMC = (data: any) => {
  const ne: Datum[] = data.map((lD: any) => {
    const newEntries = Object.entries(lD).reduce((acc, [k, v]: [any, any], i) => {
      let val = v
      // const price = v?.USD ? v.USD.price: '';
      if (k === 'id') val = String(v)
      else if (v === null) val = ' - '
      else if (k === 'quote') val = v.USD.price //? v.USD.price: ''
      else if (typeof v !== 'number' && typeof v !== 'string') {
        return acc
      }
      return { ...acc, [k]: val }
    }, {}) as Datum
    return { ...newEntries, id: String(newEntries.id) }
  }) as Datum[]
  return ne;
}
const lineDatum: Datum[] = convertFromCMC(lineData.data)
const initValue = [{
  "id": 1,
  "name": "Bitcoin",
  "symbol": "BTC",
  "slug": "bitcoin",
  "num_market_pairs": 9471,
  "date_added": "2013-04-28T00:00:00.000Z"
}]
const datumCMC = convertFromCMC(initValue)

function App() {
  const dataStyle = DataStyle(datumCMC);
  // preserve dataStyle in state
  const [dataStyleState] = useState(dataStyle)
  const [data, setData] = useState(dataStyle.getAll())
  const [selectedItem, setSelectedItem] = useState<string>('')
  const [showDetails, setShowdetails] = useState(false)
  useEffect(() => {
    dataStyle.listenItems(v => {
      if (!v) return
      setData(v)
    })
    if (MODE === 'local') {
      setTimeout(() => {
        dataStyle.setAll(lineDatum)
      }, 1000)
    } else {
      axios.get(`https://goatstone.com/info`)
        .then(res => {
          const a = convertFromCMC(res.data.data)
          dataStyle.setAll(a)
        })
    }
  }, [])
  useEffect(() => {
    const item = dataStyleState.get(selectedItem)
    if (item && selectedItem === item.id) {
      setShowdetails(item.showDetails)
    }
  }, [data])
  const onSelectChange = (id: string) => {
    setSelectedItem(id)
    const item = dataStyleState.get(id)
    if (item) {
      setShowdetails(item.showDetails)
    }
  }
  const onToggleChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
    if (!selectedItem || checked === undefined) return
    setShowdetails(checked)
    dataStyleState.setId(selectedItem, { showDetails: checked })
  }

  return (
    <div>
      <DataLook
        className={dataLookStyles}
        onClick={dataStyleState.toggle}
        dataStyles={data}
      />
      <ControlHeader>
        <h3 className={headerStyles}>DataLook</h3>
        <PopUpSelect
          entries={data}
          onChange={onSelectChange}
          className='selectorStyles'
        />
        <Toggle
          styles={toggleStyles}
          checked={showDetails}
          label="Show Details"
          defaultChecked
          onText="On"
          offText="Off"
          onChange={onToggleChange}
        />
      </ControlHeader>
    </div>
  );
}

export default App;
