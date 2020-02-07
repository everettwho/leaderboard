import React, { Component } from 'react';
import BigNumber from 'bignumber.js';
import styles from './main.module.scss';

import { ReactComponent as RefreshIcon } from './refresh.svg';

const players = [
  {
    name: 'E-Dawg',
    wallet: '0x696fcAb51956D5a408A9416b703a8E012a90Db53',
  },
  {
    name: 'Moon-liano',
    wallet: '0x0Db86254309601F625234d0819980ee8aECe0C46',
  },
  {
    name: 'Philly-G',
    wallet: '0x930f491CaEBCBBBFF2A0deB61039E87C2b0B7fE7',
  },
  {
    name: 'Bucket Lender',
    wallet: '0x798047D1143642069a4A70b3B845Bbaf87581bdB',
  },
  {
    name: 'My Dude!!!',
    wallet: '0xc494711eDdFDF35BA2522Ad0D5540EA4e59Cc2B0',
  },
  {
    name: '$CNSL',
    wallet: '0x4131d2Be8D6DA5f446c3a7Dd7bb094b27842D994',
  },
  {
    name: 'Watch Me Whip, Watch Me Nene',
    wallet: '0x77A035b677D5A0900E4848Ae885103cD49af9633',
  },
  {
    name: 'Sidding On The Moon',
    wallet: '0x6D04151ee68759254d69dAEacD0DDB93bFd0b998',
  },
  {
    name: 'Barry Me In Bitcoin',
    wallet: '0x5D9AA2D7C45d8C413BD5DE26756B375C8B4ecB22',
  },
  {
    name: 'Ken Lambo',
    wallet: '0x801B5790F335a1B6EDE241E41406460C89fC4246',
  },
  {
    name: 'Wein Moon?',
    wallet: '0x7a94831B66A7AE1948B1a94A9555A7efa99cb426',
  },
  {
    name: 'A-A-Ron',
    wallet: '0x1DE55cE7B9F84A5Ad147107Fe506B6f2F189f2C2',
  },
];

const ACCOUNTS_URI = 'https://api.dydx.exchange/v1/accounts';
const MARKETS_URI = 'https://api.dydx.exchange/v1/markets';

const ZERO = new BigNumber(0);

class Leaderboard extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    const fetchPromises = [fetch(MARKETS_URI)];

    players.forEach(({ name, wallet }) => {
      fetchPromises.push(fetch(`${ACCOUNTS_URI}/${wallet}`));
    });

    const responses = await Promise.all(fetchPromises);

    const responsePromises = [];
    responses.forEach(response => {
      responsePromises.push(response.json());
    });

    const [{ markets }, ...data] = await Promise.all(responsePromises);

    const parsedData = data.map(({ owner, accounts }) => {
      const { name } = players.find(({ wallet }) => wallet.toLowerCase() === owner.toLowerCase());

      const totalBalances = {};
      accounts.forEach(({ balances }) => {
        for (const key in balances) {
          const { marketId, wei } = balances[key];

          if (totalBalances[marketId]) {
            totalBalances[marketId] = totalBalances[marketId].plus(wei);
          } else {
            totalBalances[marketId] = new BigNumber(wei);
          }
        }
      });

      let totalValue = ZERO;
      markets.forEach(({ id, oraclePrice, currency }) => {
        const price = new BigNumber(oraclePrice).div(`1e${36 - currency.decimals}`);
        const balance = (totalBalances[id] || ZERO).div(`1e${currency.decimals}`);
        totalValue = totalValue.plus(price.times(balance));
      });

      return { name, wallet: owner, totalValue };
    });

    const sortedData = parsedData.sort((a, b) => a.totalValue.minus(b.totalValue).times(-1));
    this.setState({ data: sortedData });
  };

  renderList() {
    const { data } = this.state;
    return data.map(({ name, wallet, totalValue }, idx) => (
      <div
        key={name}
        className={styles.row}
        onClick={() => window.open(`https://trade.dydx.exchange?wallet=${wallet}`)}
      >
        <div className={styles.nameBadge}>
          <span className={styles[`badge${idx}`]}>{idx + 1}</span>
          {name}
        </div>
        <div>${totalValue.toFixed(2)}</div>
      </div>
    ));
  }

  render() {
    const { data } = this.state;

    return (
      <div className={styles.leaderboard}>
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            dYdX Leaderboard (Feb 2020)
            <RefreshIcon
              onClick={() => {
                this.setState({ data: [] });
                this.fetchData();
              }}
            />
          </div>
          {data.length > 0 ? (
            this.renderList()
          ) : (
            <div className={styles.spinner}>
              <img
                alt=""
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABGdBTUEAALGPC/xhBQAAA4lJREFUSA21lstvTVEUh++t9zPUox7R1CMhiNA0GhM66qSpAWMSiYjHyJ/AkAkSEgNGBiYmBsRjxNBEGkEkRBqNlFbRlmpxfd9x1s1pb2/T1rGSX9be6+y1fmvtvc4+p1iYhJRKpRqWbQF7wGawDNSBIugDveA1eAQ6isXib/SEomNVgXA2D9vAflALXD8r1TPQJhQ67P3YboCbJPADPa5UJYa0GY/DYAUIAtebjHpmaldnEzIB1/eAc5A/QFdIBTGE2g6CA8CxFamzBAbOEsfcdXPS9drENXCBBErosriwLCnpcQxWG4ShR7A9SdGJ/gSU5WA9aAH7QPZIgvwu9tNZ8rHEVtkOtAcYFnS8jeOgk2pC4gt5dgQcAouAMYL8Kv7nmSfig0RwamRwDESF6i/gEg5v0JMWYm1n8RVQB6In5DpBrDvoJKMCC22IMyC2yUVWd5aFvi5TFmJKegusBcazkPdgLzGH3AbFs1kMfgLfwWFwcbqk+Bbw7UadBMaU1GasB0dBoYbMJG8BEgq77yGOb9H/JMToIMB1IHHIKTklbQDzwC8g8WdwD+Qllwk0ADxOq14FmiXeBqJS9TMy/Y7ORYj1lUAWIldU3uZkNbBaz1W4PXnLfQJGxXZ5k6X7vsWtYvfZFHnLSwJapCLHGok9X28lDYpbk7f4GllxyDqJrTYQD/6H7swEHZTYLq7NGL32qn7OMuumMrR3WjMOIxK7tUsyRi/93sw8j6GXSLbi5PLowugDO1u9AeQtdrJnHJ1dtNNepSzxLm/kZvGbmosQy6aVWC7hvFyx2+05eLZufxPIS+YTKFut49813Cx2tB/4ECvfSaYrwzBdTQxJFoCo1GqH5dSgPAV2d9xgnnUrjjpNS/B15/w0ek0Kj89EkjcmISYDiR4DiUNc2E4Au3xKgs9cHLyKJZQjCuxPd7h8W/GMEy+VdqN2JJO/He4xePbPwQucHFcV/CUy0aXAYjy2aNo+/Mu3YlyTPE+InbeABhC3mWSOh8A70AX8d3auuH02kHe+PxNBJrF+Xsf+zfREtYxHV6yBrCXfBbaCCBKVRyDtBsxqE3Qelfrc9R+B1Touy6iKy1YGJFCPagSedZY4G3g8YvvE9VbZDaG7UyFViV2ZntkmhsItNaBdqY4Exmp/Ij4At9bExpUJicMj3f5a5v62+Iq5C3aqCXwDJmPj+JM/MHZbsVXIH5y6IqvXnX2mAAAAAElFTkSuQmCC"
              />
            </div>
          )}
          <div className={styles.creditLink}>
            Icons made by{' '}
            <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
              Freepik
            </a>{' '}
            from{' '}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default Leaderboard;
