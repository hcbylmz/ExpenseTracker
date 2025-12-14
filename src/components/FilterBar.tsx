import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FilterOptions } from '../types';
import { getCategories } from '../utils/categories';

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  hideSearch?: boolean;
  defaultExpanded?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange, hideSearch = false, defaultExpanded = false }) => {
  const { t } = useTranslation();
  const categories = getCategories();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  const handleCategoryToggle = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === categoryId ? undefined : categoryId,
    });
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    onFiltersChange({
      ...filters,
      searchQuery: text || undefined,
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      [type === 'start' ? 'startDate' : 'endDate']: value || undefined,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    onFiltersChange({});
  };

  const hasActiveFilters = filters.category || filters.startDate || filters.endDate || filters.searchQuery;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {hideSearch ? (
          <View style={styles.filterHeader}>
            <Ionicons name="filter" size={20} color="#4ECDC4" />
            <Text style={styles.filterTitle}>{t('filter.filters')}</Text>
          </View>
        ) : (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('filter.searchExpenses')}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('filter.category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    filters.category === category.id && {
                      backgroundColor: category.color,
                      borderColor: category.color,
                    },
                  ]}
                  onPress={() => handleCategoryToggle(category.id)}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={filters.category === category.id ? '#FFFFFF' : category.color}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      filters.category === category.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('filter.dateRange')}</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>{t('filter.from')}</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  value={filters.startDate || ''}
                  onChangeText={(text) => handleDateRangeChange('start', text)}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>{t('filter.to')}</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  value={filters.endDate || ''}
                  onChangeText={(text) => handleDateRangeChange('end', text)}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Ionicons name="close-circle" size={18} color="#FF6B6B" />
              <Text style={styles.clearButtonText}>{t('filter.clearFilters')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
  },
  expandButton: {
    padding: 4,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryScroll: {
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    marginRight: 8,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
});

