import {
  deleteChartUsingPost,
  listMyChartByPageUsingPOST,
  updateChartUsingPost
} from '@/services/SolarBi-front/chartController';
import {useModel} from '@@/exports';
import {Avatar, Button, Card, List, message, Popconfirm, Result} from 'antd';
import ReactECharts from 'echarts-for-react';
import React, {useEffect, useState} from 'react';
import Search from "antd/es/input/Search";
import UpdateModal from './components/UpdateModal';
import {ProColumns} from "@ant-design/pro-components";
import {useNavigate} from 'react-router-dom';

/**
 * 我的图表页面
 * @constructor
 */
const MyChartPage: React.FC = () => {
  const initSearchParams = {
    // 默认第一页
    current: 1,
    // 每页展示4条数据
    pageSize: 6,
  };

  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({ ...initSearchParams });
  // 从全局状态中获取到当前登录的用户信息
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState ?? {};
  const [chartList, setChartList] = useState<API.Chart[]>();
  const [total, setTotal] = useState<number>(0);
  // 加载状态，用来控制页面是否加载，默认正在加载
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // 控制更新图表模态框的显示
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  // 当前正在更新的图表数据
  const [currentRow, setCurrentRow] = useState<API.Chart>();

  // 定义表格列
  const columns: ProColumns<API.Chart>[] = [
    {
      title: '图表名称',
      dataIndex: 'name',
      valueType: 'text',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '图表名称为必填项',
          },
        ],
      },
    },
    {
      title: '分析目标',
      dataIndex: 'goal',
      valueType: 'textarea',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '分析目标为必填项',
          },
        ],
      },
    },
    {
      title: '图表类型',
      dataIndex: 'chartType',
      valueType: 'select',
      valueEnum: {
        'line': { text: '折线图' },
        'bar': { text: '柱状图' },
        'pie': { text: '饼图' },
        'scatter': { text: '散点图' },
        'radar': { text: '雷达图' },
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '图表类型为必填项',
          },
        ],
      },
    },
  ];

  // 检查用户是否已登录
  useEffect(() => {
    if (!currentUser) {
      message.warning('请先登录以查看您的图表');
      // navigate('/login'); // 假设登录页面路径为 /login
    }
  }, [currentUser, navigate]);

  const loadData = async () => {
    // 如果用户未登录，不加载数据
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Add userId to the search parameters
      const res = await listMyChartByPageUsingPOST({
        ...searchParams,
        userId: currentUser.id,  // 确保 userId 存在
      });
      if (res.data) {
        setChartList(res.data.records ?? []);
        setTotal(res.data.total ?? 0);
        if (res.data.records) {
          res.data.records.forEach(data => {
            const chartOption = JSON.parse(data.genChart ?? '{}');
            chartOption.title = undefined;
            data.genChart = JSON.stringify(chartOption);
          })
        }
      } else {
        message.error('获取我的图表失败');
      }
    } catch (e: any) {
      message.error('获取我的图表失败，' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams, currentUser]); // 添加 currentUser 依赖，当用户登录状态变化时重新加载数据

  // 处理更新图表
  const handleUpdate = async (fields: API.ChartUpdateRequest) => {
    // 确保用户已登录
    if (!currentUser) {
      message.warning('请先登录');
      return false;
    }

    const hide = message.loading('正在更新');
    try {
      await updateChartUsingPost(fields);
      hide();
      message.success('更新成功');
      setUpdateModalVisible(false);
      loadData(); // 刷新数据
      return true;
    } catch (error: any) {
      hide();
      message.error('更新失败，' + error.message);
      return false;
    }
  };

  // 处理删除图表
  const handleDelete = async (id: number) => {
    // 确保用户已登录
    if (!currentUser) {
      message.warning('请先登录');
      return false;
    }

    const hide = message.loading('正在删除');
    try {
      await deleteChartUsingPost({ id });
      hide();
      message.success('删除成功');
      loadData(); // 刷新数据
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  return (
    <div className="my-chart-page">
      {/* 如果用户未登录，显示提示信息 */}
      {!currentUser ? (
        <Result
          status="warning"
          title="未登录"
          subTitle="请先登录以查看您的图表"
          extra={
            <Button type="primary" onClick={() => navigate('/login')}>
              登录
            </Button>
          }
        />
      ) : (
        <>
          {/* 搜索区域 */}
          <div style={{ marginBottom: 16 }}>
            <Search
              placeholder="请输入图表名称"
              enterButton
              loading={loading}
              onSearch={(value) => {
                setSearchParams({
                  ...initSearchParams,
                  name: value,
                })
              }}
            />
          </div>

          {/* 图表列表 */}
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 1,
              lg: 2,
              xl: 2,
              xxl: 2,
            }}
            pagination={{
              onChange: (page, pageSize) => {
                setSearchParams({
                  ...searchParams,
                  current: page,
                  pageSize,
                })
              },
              current: searchParams.current,
              pageSize: searchParams.pageSize,
              total: total,
            }}
            loading={loading}
            dataSource={chartList}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <Card
                  style={{ width: '100%' }}
                  actions={[
                    <Button
                      type="link"
                      key="edit"
                      onClick={() => {
                        setCurrentRow(item);
                        setUpdateModalVisible(true);
                      }}
                    >
                      编辑
                    </Button>,
                    // eslint-disable-next-line react/jsx-key
                    <Popconfirm
                      title="确定要删除这个图表吗？"
                      onConfirm={() => handleDelete(item.id as number)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="link" danger key="delete">
                        删除
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={currentUser && currentUser.userAvatar} />}
                    title={item.name}
                    description={item.chartType ? '图表类型：' + item.chartType : undefined}
                  />
                  <div style={{ marginBottom: 16 }} />
                  <p>{'分析目标：' + item.goal}</p>
                  <div style={{ marginBottom: 16 }} />
                  <ReactECharts option={item.genChart && JSON.parse(item.genChart)} />
                </Card>
              </List.Item>
            )}
          />

          {/* 更新图表模态框 */}
          {currentRow && (
            <UpdateModal
              oldData={currentRow}
              visible={updateModalVisible}
              columns={columns}
              onCancel={() => {
                setUpdateModalVisible(false);
                setCurrentRow(undefined);
              }}
              onSubmit={async (values) => {
                await handleUpdate({
                  ...values,
                  id: currentRow.id as any,
                });
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MyChartPage;
