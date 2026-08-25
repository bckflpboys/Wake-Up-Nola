import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { colors, borderRadius, spacing, typography } from '../../theme';
import { Card } from '../atoms/Card';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsChartProps {
    type: 'line' | 'pie' | 'progress';
    data: any;
    title: string;
    subtitle?: string;
    hideLegend?: boolean;
    children?: React.ReactNode;
}

export const AnalyticsChart = ({ type, data, title, subtitle, hideLegend, children }: AnalyticsChartProps) => {
    const chartConfig = {
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
    };

    const renderChart = () => {
        switch (type) {
            case 'line':
                return (
                    <LineChart
                        data={data}
                        width={screenWidth - 64} // Card padding + Screen padding
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withDots={true}
                        withInnerLines={false}
                        withOuterLines={true}
                    />
                );
            case 'pie':
                return (
                    <PieChart
                        data={data}
                        width={screenWidth - 64}
                        height={220}
                        chartConfig={chartConfig}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={hideLegend ? "80" : "15"} // Center it more if legend is missing
                        center={[10, 0]}
                        absolute
                        hasLegend={!hideLegend}
                    />
                );
            case 'progress':
                return (
                    <ProgressChart
                        data={data}
                        width={screenWidth - 64}
                        height={220}
                        strokeWidth={16}
                        radius={32}
                        chartConfig={chartConfig}
                        hideLegend={false}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <View style={styles.chartContainer}>
                {renderChart()}
            </View>
            {children && (
                <View style={styles.footer}>
                    {children}
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
    },
    header: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
        color: colors.slate[900],
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.slate[500],
        marginTop: 2,
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    footer: {
        marginTop: spacing.md,
    }
});
