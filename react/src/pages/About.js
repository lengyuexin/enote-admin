import React, { PureComponent } from 'react';
import { Card } from 'antd'
import Typing from '../components/Typing.js'
import { get } from '../utils/ajax'


class About extends PureComponent {


    componentDidMount() {
        this.getUser(window.localStorage.getItem("name"))
    }

    getUser = async (name) => {

        try {
            const res = await get(`/user/getUser?name=${name}`);
            window.localStorage.setItem("sign",res.data.sign)
         
        } catch (error) {
            console.error(error)
        }

    }
    render() {
       
        return (
            <div style={{ padding: 24 }}>
                <Card bordered={false} hoverable style={{ marginBottom: 24 }} bodyStyle={{ minHeight: 130 }}>
                    <Typing className="markdown">
                        <h3>个性签名</h3>
                        {window.localStorage.getItem("sign")}
                    </Typing>
                </Card>
            </div>
        );
    }
}

export default About;