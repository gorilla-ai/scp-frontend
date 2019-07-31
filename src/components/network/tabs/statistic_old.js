import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import Gis from 'react-gis/build/src/components'
import WORLDMAP from '../../../mock/world-map-low.json'

import Checkbox from 'react-ui/build/src/components/checkbox'
import DataTable from 'react-ui/build/src/components/table'
import PieChart from 'react-chart/build/src/components/pie'
import PopupDialog from 'react-ui/build/src/components/popup-dialog'

import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc'

import helper from '../../common/helper'
import withLocale from '../../../hoc/locale-provider'

import {default as ah, getInstance} from 'react-ui/build/src/utils/ajax-helper'

let t = null;

//Charts ID must be unique
const chartsID = [
  'all-source-services',
  'all-source-services-excluding-unknown',
  'all-destination-services',
  'all-destination-services-excluding-unknown',
  'all-src-hostnames',
  'all-dst-hostnames',
  'top-10-dns-query-fails',
  'top-10-icmp-source-ip',
  'top-10-user-agents',
  'top-10-http-error-code',
  'top-10-active-ips',
  'top-10-dns-query',
  'top-10-malware-source-alerts',
  'top-10-blacklist-alerts',
  'top-10-ids-alerts',
  'top-10-attackers',
  'top-10-attacks',
  'top-10-public-destination-ips',
  'top-10-private-destination-ips',
  'top-10-attacked-honeypot',
  'top-10-attacking-ip',
  'top-10-attacking-country',
  'top-10-attacked-port',
  'top-10-attacked-protocol',
  'top-10-attacking-login',
  'top-10-attacking-password',
  'top-10-attacking-login-pass'
];

const chartsTitle = [
  'network.statistic.allSourceServices',
  'network.statistic.allSourceServicesExcludingUnknown',
  'network.statistic.allDestinationServices',
  'network.statistic.allDestinationServicesExcludingUnknown',
  'network.statistic.allSrcHostnames',
  'network.statistic.allDstHostnames',
  'network.statistic.top10DnsQueryFails',
  'network.statistic.top10IcmpSourceIP',
  'network.statistic.top10UserAgents',
  'network.statistic.top10HttpErrorCode',
  'network.statistic.top10ActiveIPs',
  'network.statistic.top10DnsQuery',
  'network.statistic.top10MalwareSourceAlerts',
  'network.statistic.top10BlacklistAlerts',
  'network.statistic.top10IdsAlerts',
  'network.statistic.top10Attackers',
  'network.statistic.top10Attacks',
  'network.statistic.top10PublicDestinationIPs',
  'network.statistic.top10PrivateDestinationIPs',
  'network.statistic.top10AttackedHoneypot',
  'network.statistic.top10AttackingIP',
  'network.statistic.top10AttackingCountry',
  'network.statistic.top10AttackedPort',
  'network.statistic.top10AttackedProtocol',
  'network.statistic.top10AttackingLogin',
  'network.statistic.top10AttackingPassword',
  'network.statistic.top10AttackingLoginPass'
];

const DragHandle = SortableHandle(({value}) => {
  return (
    <i className={cx('fg fg-menu statistic', {'hide': !value.show})}></i>
  )
});

const SortableItem = SortableElement(({index, value, handleChartsChange}) => {
  return (
    <li key={index} className='table-sort-list statistic'>
      <Checkbox
        className='data-field statistic'
        onChange={handleChartsChange.bind(this, value.chartID)}
        checked={value.show} />
      <span>{value.chartTitle}</span>
      <DragHandle
        value={value} />
    </li>
  )
});

const SortableList = SortableContainer(({sortedChartsList, handleChartsChange}) => {
  return (
    <ul className='table-sort'>
      {
        sortedChartsList.map(function(value, index) {
          return (
            <SortableItem
              key={index}
              index={index}
              value={value}
              handleChartsChange={handleChartsChange} />
          )
        })
      }
    </ul>
  );
});

class Statistic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggleSelectAll: false,
      allChartsList: [],
      userChartsList: [],
      sortedChartsList: [],
      sort: {
        field: 'number',
        desc: true
      },
      attackSort: {
        field: 'attackCnt',
        desc: true
      },
      tableData: {
        topAttackHoneypot: {
          columns: ['vpnName', 'name', 'ip', 'honeypot', 'attackCnt']
        }
      }
    };

    t = global.chewbaccaI18n.getFixedT(null, 'connections');
    this.ah = getInstance('chewbacca');
  }
  componentDidUpdate = (prevProps) => {
    this.loadAllCharts(prevProps);
  }
  componentWillUnmount = () => {
    const {baseUrl, account} = this.props;
    const {userChartsList} = this.state;
    let fieldString = '';
    let url = '';

    _.forEach(userChartsList, value => {
      fieldString += '&field=' + value;
    })

    if (!fieldString) {
      fieldString = '&field=';
    }

    url = `${baseUrl}/api/account/flow/fields?module=EVENT_STATISTICS&accountId=${account.id}${fieldString}`;

    ah.one({
      url,
      type: 'POST'
    })
    .then(data => {
      return null;
    });
  }
  loadAllCharts = (prevProps) => {
    const {statisticCharts} = this.props;
    const {sort, tableData, attackSort} = this.state;
    const lng = global.chewbaccaI18n.language;
    let tempTableData = {...tableData};
    let tempFields = {};

    tableData.topAttackHoneypot.columns.forEach(tempData => {
      tempFields[tempData] = {
        label: t(`honeynet.statistic.topAttackHoneypot.${tempData}`),
        sortable: true
      };
    })

    tempTableData.topAttackHoneypot.fields = tempFields;

    if (!_.isEmpty(statisticCharts)) {
      if (statisticCharts.topAttackHoneypot) {
        tempTableData.topAttackHoneypot.data = statisticCharts.topAttackHoneypot.rows;
      }

      let tempChartData = {
        topAttackIP: [],
        topAttackCountry: [],
        topAttackPort: [],
        topAttackProcotol: [],
        topAttackLogin: [],
        topAttackPassword: [],
        topAttackLoginPass: []
      };

      tempChartData.topAttackIP.chartData = [];
      tempChartData.topAttackCountry.chartData = statisticCharts.topAttackCountry.rows;
      tempChartData.topAttackPort.chartData = [];
      tempChartData.topAttackProcotol.chartData = statisticCharts.topAttackProcotol.rows;

      tempChartData.topAttackLogin.chartData = statisticCharts.topAttackLogin.rows;
      tempChartData.topAttackPassword.chartData = statisticCharts.topAttackPassword.rows;
      tempChartData.topAttackLoginPass.chartData = [];

      _.forEach(statisticCharts.topAttackIp.rows, val => {
        tempChartData.topAttackIP.chartData.push({
          srcIp: val.srcIp + ' - ' + val.srcCountry,
          attackCnt: val.attackCnt
        })
      })

      _.forEach(statisticCharts.topAttackPort.rows, val => {
        tempChartData.topAttackPort.chartData.push({
          destPort: val.destPort + ' ',
          attackCnt: val.attackCnt
        })
      })

      _.forEach(statisticCharts.topAttackLoginPass.rows, val => {
        tempChartData.topAttackLoginPass.chartData.push({
          account: val.account + '/' + val.password,
          totalCnt: val.totalCnt
        })
      })

      const tempAllChartsList = [
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.allSrc,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.allSrcExcUnknown,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.allDst,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.allDstExcUnknown,
          type: 'pie'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.allSrcHost,
          sort,
          type: 'table'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.allDstHost,
          sort,
          type: 'table'
        },
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.queryFails,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.icmpSource,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: this.getUserAgentData(),
          type: 'pie'
        },
        {
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.errorCode,
          type: 'pie'
        },
        {
          chartFields: this.getCommonFields(),
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.activeIP,
          type: 'pie'
        },
        {
          chartFields: this.getCommonFields(),
          chartKeyLabels: {
            service: t('txt-service'),
            number: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              service: t('txt-service'),
              number: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['service'],
            sliceSize: 'number'
          },
          chartData: statisticCharts.dnsQuery,
          type: 'pie'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.malwareAlert,
          sort,
          type: 'table'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.blacklistAlert,
          sort,
          type: 'table'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.idsAlert,
          sort,
          type: 'table'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.attacker,
          sort,
          type: 'table'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.attack,
          sort,
          type: 'table'
        },
        {
          chartFields: {
            service: {
              label: t('network.statistic.table.service'),
              sortable: true
            },
            number: {
              label: t('network.statistic.table.number'),
              sortable: true
            },
            country: {
              label: t('network.statistic.table.country'),
              sortable: true
            },
            city: {
              label: t('network.statistic.table.city'),
              sortable: true
            }
          },
          chartData: statisticCharts.publicIpDst,
          sort,
          type: 'table'
        },
        {
          chartFields: this.getCommonFields(),
          chartData: statisticCharts.privateIpDst,
          sort,
          type: 'table'
        },
        {
          chartFields: tempTableData.topAttackHoneypot.fields,
          chartData: tempTableData.topAttackHoneypot.data,
          sort: attackSort,
          type: 'table'
        },
        {
          chartKeyLabels: {
            srcIp: t('attacksFields.srcIp'),
            attackCnt: t('txt-attackCounts')
          },
          chartValueLabels: {
            "Pie Chart": {
              srcIp: t('attacksFields.srcIp'),
              attackCnt: t('txt-attackCounts')
            }
          },
          chartDataCfg: {
            splitSlice: ['srcIp'],
            sliceSize: 'attackCnt'
          },
          chartData: tempChartData.topAttackIP.chartData,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            srcCountry: t('attacksFields.srcCountry'),
            attackCnt: t('txt-attackCounts')
          },
          chartValueLabels: {
            "Pie Chart": {
              srcCountry: t('attacksFields.srcCountry'),
              attackCnt: t('txt-attackCounts')
            }
          },
          chartDataCfg: {
            splitSlice: ['srcCountry'],
            sliceSize: 'attackCnt'
          },
          chartData: tempChartData.topAttackCountry.chartData,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            destPort: t('attacksFields.destPort'),
            attackCnt: t('txt-attackCounts')
          },
          chartValueLabels: {
            "Pie Chart": {
              destPort: t('attacksFields.destPort'),
              attackCnt: t('txt-attackCounts')
            }
          },
          chartDataCfg: {
            splitSlice: ['destPort'],
            sliceSize: 'attackCnt'
          },
          chartData: tempChartData.topAttackPort.chartData,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            protocol: t('attacksFields.protocol'),
            attackCnt: t('txt-attackCounts')
          },
          chartValueLabels: {
            "Pie Chart": {
              protocol: t('attacksFields.protocol'),
              attackCnt: t('txt-attackCounts')
            }
          },
          chartDataCfg: {
            splitSlice: ['protocol'],
            sliceSize: 'attackCnt'
          },
          chartData: tempChartData.topAttackProcotol.chartData,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            account: t('txt-account'),
            totalCnt: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              account: t('txt-account'),
              totalCnt: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['account'],
            sliceSize: 'totalCnt'
          },
          chartData: tempChartData.topAttackLogin.chartData,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            password: t('txt-password'),
            totalCnt: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              password: t('txt-password'),
              totalCnt: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['password'],
            sliceSize: 'totalCnt'
          },
          chartData: tempChartData.topAttackPassword.chartData,
          type: 'pie'
        },
        {
          chartKeyLabels: {
            account: t('txt-accountPassword'),
            totalCnt: t('txt-count')
          },
          chartValueLabels: {
            "Pie Chart": {
              account: t('txt-accountPassword'),
              totalCnt: t('txt-count')
            }
          },
          chartDataCfg: {
            splitSlice: ['account'],
            sliceSize: 'totalCnt'
          },
          chartData: tempChartData.topAttackLoginPass.chartData,
          type: 'pie'
        }
      ];

      const allChartsList = _.map(tempAllChartsList, (val, i) => {
        return {
          chartID: chartsID[i], //Insert chart ID
          chartTitle: t(chartsTitle[i]), //Insert chart title
          ...val
        }
      });

      if (statisticCharts !== prevProps.statisticCharts) {
        this.setState({
          allChartsList
        }, () => {
          this.loadUserCharts();
        });
      }
    }
  }
  loadUserCharts = () => {
    const {baseUrl, account} = this.props;
    const url = `${baseUrl}/api/account/flow/fields?module=EVENT_STATISTICS&accountId=${account.id}`;

    this.ah.one({
      url,
      type: 'GET'
    })
    .then(data => {
      let toggleSelectAll = false;

      if (data.length === chartsID.length) {
        toggleSelectAll = true;
      }

      this.setState({
        toggleSelectAll,
        userChartsList: data
      }, () => {
        this.getSortedCharts();
      });

      return null;
    })
    .catch(err => {
      helper.showPopupMsg('', t('txt-error'), err.message);
    })
  }
  onSortEnd = (listObj) => {
    const {userChartsList} = this.state;

    this.setState({
      userChartsList: arrayMove(userChartsList, listObj.oldIndex, listObj.newIndex)
    }, () => {
      const {userChartsList} = this.state;
      let tempUserChartsList = [];

      _.forEach(userChartsList, val => {
        if (val) {
          tempUserChartsList.push(val);
        }
      });
      
      this.setState({
        userChartsList: tempUserChartsList
      }, () => {
        this.getSortedCharts();
      });
    });
  }
  getHiddenChartsList = () => {
    const {userChartsList} = this.state;
    let hiddenChartsList = [];

    _.forEach(chartsID, val => {
      if (userChartsList.indexOf(val) === -1) {
        hiddenChartsList.push(val);
      }
    })

    return hiddenChartsList;
  }
  handleSelectAll = () => {
    this.setState({
      toggleSelectAll: !this.state.toggleSelectAll
    }, () => {
      const {toggleSelectAll, userChartsList} = this.state;
      let combinedChartsList = [];

      if (toggleSelectAll) {
        combinedChartsList = _.concat(userChartsList, this.getHiddenChartsList());
      }

      this.setState({
        userChartsList: combinedChartsList
      }, () => {
        this.getSortedCharts();
      });
    });
  }
  getChartsData = (dataList, type) => {
    const {allChartsList} = this.state;
    let list = [];

    _.forEach(dataList, val => {
      _.forEach(allChartsList, val2 => {
        if (val === val2.chartID) {
          list.push({
            ...val2,
            show: type
          });
        }
      })
    })

    return list;
  }
  getSortedCharts = () => {
    const sortedChartsListShow = this.getChartsData(this.state.userChartsList, true); //Data to show
    const sortedChartsListHidden = this.getChartsData(this.getHiddenChartsList(), false); //Data to hide

    this.setState({
      sortedChartsList: _.concat(sortedChartsListShow, sortedChartsListHidden)
    });
  }
  handleChartsChange = (chartID) => {
    const {userChartsList} = this.state;
    const arrIndex = userChartsList.indexOf(chartID);
    let tempUserChartsList = _.cloneDeep(userChartsList);
    let toggleSelectAll = false;

    if (arrIndex > -1) { //Remove chart ID if already exist in array
      tempUserChartsList.splice(arrIndex, 1);
    } else { //Add chart ID if not exist in array
      tempUserChartsList.push(chartID);
    }

    if (tempUserChartsList.length === chartsID.length) {
      toggleSelectAll = true;
    }

    this.setState({
      userChartsList: tempUserChartsList,
      toggleSelectAll
    }, () => {
      this.getSortedCharts();
    });
  }
  getUserAgentData = () => {
    const {statisticCharts} = this.props;
    const userAgent = statisticCharts.userAgent;
    let userAgentService = '';
    let userAgentArr = [];

    if (userAgent && userAgent.length > 0) {
      for (var i = 0; i < userAgent.length; i++) {
        userAgentService = userAgent[i].service.substr(0, 35) + '...';
        userAgentArr.push({
          number: userAgent[i].number,
          service: userAgentService
        });
      }
    }

    return userAgentArr;
  }
  displayWorldMap = () => {
    const publicIpDst = this.props.statisticCharts.publicIpDst;
    let geoJson = {
      mapDataArr: [],
      attacksDataArr: []
    };

    _.forEach(WORLDMAP.features, val => {
      const countryObj = {
        type: 'geojson',
        id: val.properties.name,
        weight: 0.6,
        fillColor: 'white',
        color: '#182f48',
        fillOpacity: 1
      };

      countryObj.geojson = val.geometry;
      geoJson.mapDataArr.push(countryObj);
    });

     _.forEach(publicIpDst, val => {
      if (val.latitude && val.longitude) {
        let uniqueID = val.country + '-' + val.city +  '-' + val.counts;
        uniqueID = uniqueID.replace(/ /g, "-");

        geoJson.attacksDataArr.push({
          type: 'spot',
          id: `${uniqueID}`,
          latlng: [
            val.latitude,
            val.longitude
          ],
          data: {
            tag: 'red'
          },
          tooltip: () => {
            return `<div>${t('payloadsFields.destIp')}: ${val.service}</div><div>${t('payloadsFields.destCity')}: ${val.city}</div><div>${t('payloadsFields.destCountry')}: ${val.country}</div>`
          }
        });
      }
    });

    return (
      <Gis
        className='gis-map'
        data={geoJson.mapDataArr}
        layers={{
          world: {
            label: 'World Map',
            interactive: false,
            data: geoJson.attacksDataArr
          }
        }}
        activeLayers={['world']}
        baseLayers={{
          standard: {
            id: 'world',
            layer: 'world'
          }
        }}
        mapOptions={{
          crs: L.CRS.Simple
        }}
        symbolOptions={[{
          match: {
            type:'geojson'
          },
          selectedProps: {
            'fill-color': 'white',
            color: 'black',
            weight: 0.6,
            'fill-opacity': 1
          }
        },
        {
          match: {
            type: 'spot'
          },
          props: {
            'background-color': ({data}) => {
              return data.tag === 'red' ? 'red' : 'yellow';
            },
            'border-color': '#333',
            'border-width': '1px'
          }
        }]}
        layouts={['standard']}
        dragModes={['pan']} />
    )
  }
  handleTableRowClick = (type) => {
    if (type === 'top-10-public-destination-ips') {
      PopupDialog.alert({
        title: t('txt-worldMap'),
        id: 'modalWindow',
        confirmText: t('txt-confirm'),
        display: this.displayWorldMap(),
        act: (confirmed, data) => {
        }
      });
    }
    return null;
  }
  getCommonFields = () => {
    return {
      service: {
        label: t('network.statistic.table.service'),
        sortable: true,
        formatter: (value, allValue) => {
          if (value.length > 50) {
            const formattedValue = value.substr(0, 50) + '...';
            return <a className='no-underline' onClick={helper.showPopupMsg.bind(this, value, t('network.statistic.table.service'))}>{formattedValue}</a>;
          } else {
            return <span>{value}</span>;
          }
        }
      },
      number: {
        label: t('network.statistic.table.number'),
        sortable: true
      }
    };
  }
  render() {
    const {toggleSelectAll, sortedChartsList} = this.state;

    return (
      <div className='main-statistic c-flex boxes'>
        <div className='c-box nav'>
          <div className='select-all'>
            <label>{t('network.statistic.txt-statisticCharts')}</label>
            <Checkbox
              onChange={this.handleSelectAll}
              checked={toggleSelectAll} />
          </div>
          <SortableList 
            sortedChartsList={sortedChartsList}
            onSortEnd={this.onSortEnd}
            handleChartsChange={this.handleChartsChange}
            useDragHandle={true}
            lockToContainerEdges={true} />
        </div>

        <div className='c-box content'>
          <div className='statistic'>
            {
              sortedChartsList.map((key, i) => {
                if (sortedChartsList[i].type === 'pie') {
                  if (sortedChartsList[i].show) {
                    return (
                      <div className='chart-group' key={sortedChartsList[i].chartID}>
                        <PieChart
                          id={sortedChartsList[i].chartID}
                          title={sortedChartsList[i].chartTitle}
                          data={sortedChartsList[i].chartData}
                          keyLabels={sortedChartsList[i].chartKeyLabels}
                          valueLabels={sortedChartsList[i].chartValueLabels}
                          dataCfg={sortedChartsList[i].chartDataCfg} />
                      </div>
                    )
                  } else {
                    return null;
                  }
                } else if (sortedChartsList[i].type === 'table') {
                  if (!sortedChartsList[i].chartFields) {
                    return null;
                  }

                  if (sortedChartsList[i].show) {
                    return (
                      <div className={cx('chart-group', {'full-width': sortedChartsList[i].chartID === 'top-10-attacked-honeypot'})} key={sortedChartsList[i].chartID}>
                        <div id={sortedChartsList[i].chartID} className='c-chart'>
                          <header>{sortedChartsList[i].chartTitle}</header>
                          <DataTable
                            className={cx('main-table', {'no-pointer': sortedChartsList[i].chartID !== 'top-10-public-destination-ips'})}
                            fields={sortedChartsList[i].chartFields}
                            data={sortedChartsList[i].chartData}
                            defaultSort={sortedChartsList[i].chartData ? sortedChartsList[i].sort : {}}
                            onRowClick={this.handleTableRowClick.bind(this, sortedChartsList[i].chartID)} />
                        </div>
                      </div>
                    )
                  } else {
                    return null;
                  }
                }
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

Statistic.propTypes = {
  statisticCharts: PropTypes.object.isRequired
};

export default withLocale(Statistic);