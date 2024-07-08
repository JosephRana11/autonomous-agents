'use client';

import { useEffect, useState } from 'react';

import Head from 'next/head';

import { fecthTriggerHistoryMetric } from '@api/triggerHistoryMetric';
import { useQuery } from '@tanstack/react-query';

import { convertDictToGraphDataFormat } from '@app/components/Chart/ChartFilter';
import { IChartFilterOption } from '@app/components/Chart/ChartFilter';
import { chartFilterOptions } from '@app/components/Chart/ChartFilter';
import CustomLineChart from '@app/components/Chart/CustomLineChart';
import { Card } from '@app/components/atoms/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@app/components/atoms/DropDownMenu';

import DashboardCards from './components/DashboardCards';

export default function Home() {
    const { data: triggerHistoryMetric } = useQuery({
        queryKey: ['TriggerHistoyMetric'],
        queryFn: () => fecthTriggerHistoryMetric([])
    });

    const [chartDataSource, setChartDataSource] = useState<
        { count: number; values: Record<string, number> }[]
    >([]);

    const [currentChartFilterOption, setCurrentChartFilterOption] =
        useState<IChartFilterOption>(chartFilterOptions[1]);

    useEffect(() => {
        if (triggerHistoryMetric !== undefined) {
            switch (currentChartFilterOption.placeholder) {
                case 'Last Hour':
                    setChartDataSource(
                        triggerHistoryMetric.last_hour_successful_triggers
                    );
                    break;
                case 'Last 24 Hours':
                    setChartDataSource(
                        triggerHistoryMetric.last_24hour_successful_triggers
                    );
                    break;
                case 'Last 7 Days':
                    setChartDataSource(
                        triggerHistoryMetric.last_week_successful_triggers
                    );
                    break;
            }
        }
    }, [currentChartFilterOption, triggerHistoryMetric]);

    return (
        <>
            <Head>
                <title>Dashboard</title>
            </Head>
            <div className="w-full overflow-y-auto">
                <DashboardCards />
            </div>
            <Card className="mt-8 flex flex-row gap-y-8 py-4 pb-16 pr-12 pt-2 2xl:mt-12 5xl:mt-16">
                <span className="h4 rotate-180 text-center [writing-mode:vertical-lr]">
                    Transaction Volume
                </span>
                <div className="mt-5 w-full pr-6">
                    <div className="flex justify-between">
                        <span className="title-1">Transactions</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                border={true}
                                className="flex min-w-40 justify-between"
                            >
                                {currentChartFilterOption.placeholder}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-white">
                                {chartFilterOptions.map(
                                    (item: IChartFilterOption, index) => (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setCurrentChartFilterOption({
                                                    placeholder: item.placeholder,
                                                    unit: item.unit,
                                                    xaxisInterval: item.xaxisInterval
                                                });
                                            }}
                                            key={index}
                                        >
                                            {item.placeholder}
                                        </DropdownMenuItem>
                                    )
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="mt-2 h-[355px] 2xl:h-[500px] 4xl:h-[600px]">
                        <CustomLineChart
                            chartData={
                                triggerHistoryMetric !== undefined
                                    ? convertDictToGraphDataFormat(
                                          chartDataSource || [],
                                          currentChartFilterOption.unit
                                      )
                                    : []
                            }
                            xaxisInterval={currentChartFilterOption.xaxisInterval}
                        />
                        <div className="mt-2 text-center">
                            Time ({currentChartFilterOption.unit})
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
}
