import React from 'react'
import Moment from 'moment'
import Alarm from 'app/widgets/alarm'
import {mount} from 'enzyme'

jest.useFakeTimers();
describe('alarm test', async () => {
    test('polling data test', async () => {
        const props = {
            "type": "polling",
            "options": {
                "delay": 3,
                "query": {
                    "url": "/polling-data-test",
                    "type": "GET"
                },
                "startDttmKey": "startTime",
                "endDttmKey": "endTime"
            },
            "dataCfg": {
                "messageType": {
                    "key": "type",
                    "valueMapping": {
                        "Success": "success",
                        "Info": "info",
                        "Warning": "warning",
                        "Error": "error"
                    }
                },
                "titleKey": "title",
                "messageKey": "message"
            },
            "autoDismiss": 5
        }
        const wrapper = mount(<Alarm {...props} />)
        const instance = wrapper.instance()
        // const spyLoadDataWithQueryConfig = jest.spyOn(WidgetLoader, 'loadDataWithQueryConfig')
        const spyLoadDataWithQueryConfig = jest.spyOn(instance, 'loadDataWithQueryConfig')
        spyLoadDataWithQueryConfig.mockImplementationOnce((data) => {
            let {query: {data: {endTime}}} = data
            let startTime = Moment(endTime).subtract(3, "seconds").utc().format('YYYY-MM-DDTHH:mm:ss.SS[Z]')
            expect(data).toEqual({
                "query": {
                    "url": "/polling-data-test",
                    "type": "GET",
                    "data": {
                        startTime,
                        endTime
                    }
                },
                selectKey: undefined
            })
        })
        // Fast-forward until all timers have been executed
        jest.advanceTimersByTime(5000);
    })
    test('[method] addNotifications', async () => {
        const props = {
            "type": "polling",
            "options": {
                "delay": 20,
                "query": {
                    "url": "/polling-data-test",
                    "type": "GET"
                }
            },
            "dataCfg": {
                "messageType": {
                    "key": "type",
                    "valueMapping": {
                        "Success": "success",
                        "Info": "info",
                        "Warning": "warning",
                        "Error": "error"
                    }
                },
                "titleKey": "title",
                "messageKey": "content"
            },
            "autoDismiss": 5
        }
        const wrapper = mount(<Alarm {...props} />)
        const instance = wrapper.instance()
        await instance.addNotifications([{title: "title", content: "message", type: "Success"}])
        wrapper.update()
        // let test = wrapper.debug()
        // console.log(test)
        expect(wrapper.find('.notification.notification-success').length).toBe(1)
        expect(wrapper.find('h4.title').text()).toEqual('title')
        expect(wrapper.find('p.message').text()).toEqual('message')
    })
})